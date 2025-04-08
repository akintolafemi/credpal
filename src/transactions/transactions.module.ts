import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transactions } from '@entities/transaction.entity';
import { Users } from '@entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Transactions])],
  providers: [TransactionsService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
