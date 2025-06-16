import { HttpStatus } from '@nestjs/common';
import { DomainCustomException } from '../common/errors/domain-custom-exception';
import { DomainErrorCode } from '../common/errors/domain-error-code';

export class SubscriptionEntity {
  constructor(
    public readonly subscriptionId: number,
    public readonly userId: number,
    public readonly streamerId: number,
    public isConnected: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  connect() {
    if (this.isConnected) {
      throw new DomainCustomException(HttpStatus.CONFLICT, DomainErrorCode.DUPLICATED_SUBSCRIPTION);
    }

    this.isConnected = true;

    return this;
  }
}
