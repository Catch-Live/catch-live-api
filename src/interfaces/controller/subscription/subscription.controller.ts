import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { SubscriptionUseCase } from 'src/application/subscription/subscription.use-case';
import { ResultResponseDto } from '../common/dto/result.response.dto';
import { GetSubscriptionsResponseDto } from './dto/subscription.response.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserId } from '../common/decorators/user.decorator';
import { SubscribeChannelRequestDto } from './dto/subscribe-channel.request.dto';

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionUseCase: SubscriptionUseCase) {}

  @Get()
  async getSubscriptions(): Promise<ResultResponseDto<GetSubscriptionsResponseDto>> {
    const subscriptions = await this.subscriptionUseCase.getSubscriptions();

    const responseDto = GetSubscriptionsResponseDto.of(subscriptions);

    return ResultResponseDto.success(responseDto);
  }

  @Post()
  async subscribeChannel(
    @UserId() userId: number,
    @Body() subscribeChannelRequestDto: SubscribeChannelRequestDto,
    @Res() res: Response
  ) {
    const { channelUrl } = subscribeChannelRequestDto;

    await this.subscriptionUseCase.subscribe(userId, channelUrl);

    return res.status(201).json(ResultResponseDto.success());
  }
}
