import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '@entities/user.entity';
import { VerificationCodes } from '@entities/code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, VerificationCodes])],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
