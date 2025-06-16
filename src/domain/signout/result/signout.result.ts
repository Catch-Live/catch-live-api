import { Provider, SignoutResponseEntity } from 'src/domain/signout/entity/signout.entity';

export { Provider };

export interface SignoutResponseResult {
  is_updated: boolean;
}

export function resultFromEntity(entity: SignoutResponseEntity): SignoutResponseResult {
  return { is_updated: entity.is_updated };
}
