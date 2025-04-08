import { Module } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationCodes } from '@entities/code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationCodes])],
  providers: [CronjobsService],
})
export class CronjobsModule {}
