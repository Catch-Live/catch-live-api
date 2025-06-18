import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { StreamingServerClient } from 'src/domain/streamer/client/streaming-server.client';
import { LiveStreamerResult } from 'src/domain/streamer/result/live-streamer.result';
import { StreamerWithChannelResult } from 'src/domain/streamer/result/streamer-with-channel.result';
import { getNextYouTubeApiKey } from 'src/support/client.util';
import { YouTubeSearchResponse } from './dto/youtube.dto';
import { ChzzkLiveStatusResponse } from './dto/chzzk.dto';
import { ChannelInfo, Platform } from 'src/domain/streamer/streamer.entity';
import { YouTubeChannelResponse } from './dto/youtube-channel.dto';
import { RequestCustomException } from 'src/interfaces/controller/common/errors/request-custom-exception';
import { RequestErrorCode } from 'src/interfaces/controller/common/errors/request-error-code';
import { ChzzkChannelResponse } from './dto/chzzk-channel.dto';
import { API_URL } from 'src/infrastructure/common/infra.constants';

@Injectable()
export class StreamingServerCoreClient implements StreamingServerClient {
  private readonly logger = new Logger(StreamingServerCoreClient.name);

  async getLiveStreamers(streamers: StreamerWithChannelResult[]): Promise<LiveStreamerResult[]> {
    const asyncJobs = this.createLiveStatusRequests(streamers);
    const settledResults = await Promise.allSettled(asyncJobs);

    const parsedResults = await Promise.all(
      settledResults
        .filter(
          (
            res
          ): res is PromiseFulfilledResult<
            AxiosResponse<YouTubeSearchResponse | ChzzkLiveStatusResponse>
          > => res.status === 'fulfilled'
        )
        .map((res) => this.parseLiveStatusResponse(res.value.data, streamers))
    );

    return parsedResults.filter((result): result is LiveStreamerResult => !!result);
  }

  private parseLiveStatusResponse(
    data: YouTubeSearchResponse | ChzzkLiveStatusResponse,
    streamers: StreamerWithChannelResult[]
  ): LiveStreamerResult | undefined {
    if (this.isYouTubeResponse(data)) {
      return this.extractYouTubeLiveInfo(data, streamers);
    }
    if (this.isChzzkResponse(data)) {
      return this.extractChzzkLiveInfo(data, streamers);
    }
    return undefined;
  }

  private extractYouTubeLiveInfo(
    data: YouTubeSearchResponse,
    streamers: StreamerWithChannelResult[]
  ): LiveStreamerResult | undefined {
    const liveItem = data.items.find((item) => item.snippet.liveBroadcastContent === 'live');

    if (!liveItem) {
      return;
    }

    const streamer = streamers.find((s) => s.channel.channelId === liveItem.snippet.channelId);
    if (!streamer) {
      return;
    }

    return {
      streamerId: streamer.streamerId,
      channel: streamer.channel,
      createdAt: streamer.createdAt,
      subscriptions: [...streamer.subscriptions],
      title: liveItem.snippet.title,
      videoId: liveItem.id,
      isLive: streamer.isLive,
    };
  }

  private extractChzzkLiveInfo(
    data: ChzzkLiveStatusResponse,
    streamers: StreamerWithChannelResult[]
  ): LiveStreamerResult | undefined {
    const { status, channelId, liveTitle } = data.content;
    if (status === 'CLOSE') {
      return;
    }

    const streamer = streamers.find((s) => s.channel.channelId === channelId);
    if (!streamer) {
      return;
    }

    return {
      streamerId: streamer.streamerId,
      channel: streamer.channel,
      createdAt: streamer.createdAt,
      subscriptions: streamer.subscriptions && [...streamer.subscriptions],
      title: liveTitle,
      isLive: streamer.isLive,
    };
  }

  private isYouTubeResponse(data: any): data is YouTubeSearchResponse {
    return typeof data?.kind === 'string' && Array.isArray(data?.items);
  }

  private isChzzkResponse(data: any): data is ChzzkLiveStatusResponse {
    return (
      typeof data?.content?.status === 'string' && typeof data?.content?.channelId === 'string'
    );
  }

  private createLiveStatusRequests(streamers: StreamerWithChannelResult[]): any[] {
    const jobs = streamers.map(async (streamer) => {
      const { platform, channelId } = streamer.channel;

      if (platform === 'CHZZK') {
        const CHZZK_BASE_URL = API_URL.CHZZK.BASE;

        return axios.get<ChzzkLiveStatusResponse>(
          `${CHZZK_BASE_URL}/polling/v2/channels/${channelId}/live-status`
        );
      }

      if (platform === 'YOUTUBE') {
        const YOUTUBE_LIVE_URL = API_URL.YOUTUBE.LIVE;
        const YOUTUBE_BASE_URL = API_URL.YOUTUBE.BASE;
        const res = await axios.get(`${YOUTUBE_LIVE_URL}/channel/${channelId}/live`, {});
        const html = res.data as string;
        const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        const videoId = match ? match[1] : null;

        if (!videoId) {
          return;
        }

        const youtubeKey = getNextYouTubeApiKey();
        const params = {
          key: youtubeKey,
          part: 'snippet',
          id: videoId,
        };

        return axios.get<YouTubeSearchResponse>(`${YOUTUBE_BASE_URL}/youtube/v3/videos`, {
          params,
        });
      }
    });

    return jobs;
  }

  async getChannelInfo(channelUrl: string): Promise<ChannelInfo> {
    const url = new URL(channelUrl);
    const hostname = url.hostname;
    const pathname = url.pathname;

    if (hostname.includes('youtube.com')) {
      if (!pathname.startsWith('/@')) {
        throw new RequestCustomException(RequestErrorCode.INVALID_CHANNEL_URL);
      }

      const handle = pathname.slice(1);
      const response = await this.getYoutubeChannelInfoFromHandle(handle);
      const items = response.data.items;

      if (!items || items.length === 0) {
        this.logger.error('YouTube 채널 정보를 찾을 수 없습니다.');
        throw new RequestCustomException(RequestErrorCode.INVALID_CHANNEL_URL);
      }

      const {
        id,
        snippet: { title },
      } = items[0];

      return { channelId: id, channelName: title, platform: Platform.YOUTUBE };
    }

    if (hostname.includes('chzzk.naver.com')) {
      const channelId = pathname.split('/')[1];
      if (!channelId) {
        throw new RequestCustomException(RequestErrorCode.INVALID_CHANNEL_URL);
      }

      const CHZZK_BASE_URL = API_URL.CHZZK.BASE;
      const response = await axios.get<ChzzkChannelResponse>(
        `${CHZZK_BASE_URL}/service/v1/channels/${channelId}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
          },
          timeout: 5000,
        }
      );
      const content = response.data.content;

      if (!content || content.channelId === null) {
        this.logger.error('CHZZK 채널 정보를 찾을 수 없습니다.');
        throw new RequestCustomException(RequestErrorCode.INVALID_CHANNEL_URL);
      }

      return { ...content, platform: Platform.CHZZK };
    }

    this.logger.error('지원하지 않는 플랫폼입니다.');
    throw new RequestCustomException(RequestErrorCode.INVALID_CHANNEL_URL);
  }

  private async getYoutubeChannelInfoFromHandle(handle: string) {
    const apiKey = getNextYouTubeApiKey();
    const YOUTUBE_BASE_URL = API_URL.YOUTUBE.BASE;
    const params = {
      part: 'snippet',
      forHandle: handle,
      key: apiKey,
    };

    return axios.get<YouTubeChannelResponse>(`${YOUTUBE_BASE_URL}/youtube/v3/channels`, {
      params,
    });
  }
}
