import { Test, TestingModule } from '@nestjs/testing';
import { SignoutController } from 'src/interfaces/signout/signout.controller';
import { SignoutUseCase } from 'src/application/signout/signout.use-case';

describe('SignoutController', () => {
  let controller: SignoutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignoutController],
      providers: [SignoutUseCase],
    }).compile();

    controller = module.get<SignoutController>(SignoutController);
  });

  it('응답이 기대하던 형태로 전송되는지 확인', () => {
    const response = controller.deleteUser();
    console.log('response: ', response);
    expect(response).toHaveProperty('code', '200');
    expect(response).toHaveProperty('message', 'ok');
  });
});
