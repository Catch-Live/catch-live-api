import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from 'src/interfaces/profile/profile.controller';
import { ProfileUseCase } from 'src/application/profile/profile.use-case';

const testData = {
  provider: 'kakao',
  email: 'kakao@kakao.com',
  createdAt: new Date(),
};

describe('ProfileController', () => {
  let controller: ProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [ProfileUseCase],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  it('응답이 기대하던 형태로 전송되는지 확인', () => {
    const response = controller.getProfile();
    console.log(response);
    expect(response).toHaveProperty('code', '200');
    expect(response).toHaveProperty('message', 'OK');
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('provider');
    expect(response.data).toHaveProperty('email');
    expect(response.data).toHaveProperty('createdAt');
    expect(response.data.provider).toEqual(testData.provider);
    expect(response.data.email).toEqual(testData.email);
  });
});
