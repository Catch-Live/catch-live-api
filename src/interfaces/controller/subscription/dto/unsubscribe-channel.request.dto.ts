import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class UnsubscribeChannelRequestDto {
  @Type(() => Number)
  @IsNumber()
  subscriptionId: number;
}
