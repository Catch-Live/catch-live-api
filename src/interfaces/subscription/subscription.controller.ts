import { Controller, Get } from '@nestjs/common';
import { SubscriptionUseCase } from 'src/application/subscription/subscription.use-case';
import { ResultResponseDto } from '../common/dto/result.response.dto';
import { GetSubscriptionsResponseDto } from './dto/subscription.response.dto';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionUseCase: SubscriptionUseCase) {}

  @Get()
  async getSubscriptions(): Promise<ResultResponseDto<GetSubscriptionsResponseDto>> {
    const subscriptions = await this.subscriptionUseCase.getSubscriptions();

    const responseDto = GetSubscriptionsResponseDto.of(subscriptions);

    return ResultResponseDto.success(responseDto);
  }
}
