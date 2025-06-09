import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthUseCase } from 'src/application/auth/auth.use-case';
import { UserModule } from '../user/user.module';
import { AuthService } from 'src/domain/auth/auth.service';
import { JwtUtil } from 'src/support/jwt.util';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [UserModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthUseCase, AuthService, JwtUtil],
})
export class AuthModule {}
