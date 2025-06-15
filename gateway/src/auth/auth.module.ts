import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [GoogleStrategy],
})
export class AuthModule {}
