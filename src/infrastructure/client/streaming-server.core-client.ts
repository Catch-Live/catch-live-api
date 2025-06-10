import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { StreamingServerClient } from 'src/domain/streamer/client/streaming-server.client';
import { LiveStreamerResult } from 'src/domain/streamer/result/live-streamer.result';
import { StreamerWithChannelResult } from 'src/domain/streamer/result/streamer-with-channel.result';
import { YouTubeSearchResponse } from './dto/youtube.dto';
import { ChzzkLiveStatusResponse } from './dto/chzzk.dto';
import { STREAMER_REPOSITORY, StreamerRepository } from 'src/domain/streamer/streamer.repository';
import { getNextYouTubeApiKey } from 'src/support/client.util';

@Injectable()
export class StreamingServerCoreClient implements StreamingServerClient {
  constructor(
    @Inject(STREAMER_REPOSITORY) private readonly streamerRepository: StreamerRepository
  ) {}

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

  private async parseLiveStatusResponse(
    data: YouTubeSearchResponse | ChzzkLiveStatusResponse,
    streamers: StreamerWithChannelResult[]
  ): Promise<LiveStreamerResult | undefined> {
    if (this.isYouTubeResponse(data)) {
      return this.extractYouTubeLiveInfo(data, streamers);
    }
    if (this.isChzzkResponse(data)) {
      return this.extractChzzkLiveInfo(data, streamers);
    }
    return undefined;
  }

  private async extractYouTubeLiveInfo(
    data: YouTubeSearchResponse,
    streamers: StreamerWithChannelResult[]
  ): Promise<LiveStreamerResult | undefined> {
    const liveItem = data.items.find((item) => item.liveStreamingDetails);

    if (!liveItem) {
      const videoId = data.items[0]?.id;
      const streamer = streamers.find((s) => s.channel.videoId === videoId);

      if (!streamer) {
        return;
      }

      await this.streamerRepository.clearVideoIdByStreamerId(streamer?.streamerId);
      return;
    }

    const streamer = streamers.find((s) => s.channel.videoId === liveItem.id);
    if (!streamer) {
      return;
    }

    return {
      streamerId: streamer.streamerId,
      channel: streamer.channel,
      createdAt: streamer.createdAt,
      title: liveItem.snippet.title,
      videoId: liveItem.id,
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
      title: liveTitle,
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
    const jobs = streamers.map((streamer) => {
      const { platform, channelId } = streamer.channel;

      if (platform === 'CHZZK') {
        const chzzkBaseUrl = process.env.CHZZK_BASE_URL;

        return axios.get<ChzzkLiveStatusResponse>(
          `${chzzkBaseUrl}/polling/v2/channels/${channelId}/live-status`
        );
      }

      if (platform === 'YOUTUBE' && streamer.channel.videoId !== '') {
        const youtubeBaseUrl = process.env.YOUTUBE_BASE_URL;
        const youtubeKey = getNextYouTubeApiKey();
        const params = {
          key: youtubeKey,
          part: 'snippet,liveStreamingDetails',
          id: streamer.channel.videoId,
        };

        return axios.get<YouTubeSearchResponse>(`${youtubeBaseUrl}/youtube/v3/videos`, {
          params,
        });
      }
    });

    return jobs;
  }
}
