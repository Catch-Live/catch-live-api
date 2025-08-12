import { ProfileResponseResult } from './result/profile.response.result';

export const PROFILE_REPOSITORY = Symbol('ProfileRepository');

export interface ProfileRepository {
  findFirst(userId: number): Promise<ProfileResponseResult>;
}
