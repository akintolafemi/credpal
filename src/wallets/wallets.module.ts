import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { BullModule } from '@nestjs/bullmq';
import { BullMQQueueType } from 'src/types/bullmq.types';
import { WalletConsumer } from './wallet.consumer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallets } from '@entities/wallet.entity';
import { SubWallets } from '@entities/subwallet.entity';
import { Users } from '@entities/user.entity';
import { RatesService } from './rates.service';
import { Transactions } from '@entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallets, SubWallets, Users, Transactions]),
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: `${process.env.BULL_MQ_HOST}`,
          port: Number(process.env.BULL_MQ_PORT),
        },
      }),
    }),
    BullModule.registerQueue({
      name: BullMQQueueType.WALLET,
    }),
  ],
  providers: [WalletsService, WalletConsumer, RatesService],
  controllers: [WalletsController],
})
export class WalletsModule {}
