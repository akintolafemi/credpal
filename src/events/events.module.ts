import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { VerificationCodes } from '@entities/code.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogs } from '@entities/audit.entity';
import { Wallets } from '@entities/wallet.entity';
import { Users } from '@entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationCodes, AuditLogs, Wallets, Users]),
  ],
  providers: [EventsService],
})
export class EventsModule {}
