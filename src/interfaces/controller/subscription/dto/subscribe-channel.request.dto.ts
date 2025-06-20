import { IsUrl } from 'class-validator';

export class SubscribeChannelRequestDto {
  @IsUrl()
  channelUrl: string;
}
