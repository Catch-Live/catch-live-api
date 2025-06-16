import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class unsubscribeChannelRequestDto {
  @Type(() => Number)
  @IsNumber()
  subscriptionId: number;
}
