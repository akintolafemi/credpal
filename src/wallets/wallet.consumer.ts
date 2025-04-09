import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { BullMQQueueType } from 'src/types/bullmq.types';
import {
  FundWalletType,
  TransactionStatus,
  WalletActionTypes,
} from 'src/types/wallet.types';
import { SubWallets } from '@entities/subwallet.entity';
import { RatesService } from './rates.service';
import { Transactions } from '@entities/transaction.entity';

//create a new bull mq processor for wallet
//this will process the wallet funding jobs
@Processor(BullMQQueueType.WALLET)
export class WalletConsumer extends WorkerHost {
  //create a new logger instance for wallet consumer
  private readonly logger = new Logger(WalletConsumer.name);

  //constructor to inject the dependencies
  constructor(
    private ratesService: RatesService,
    @InjectRepository(SubWallets) private subWalletRepo: Repository<SubWallets>,
    private dataSource: DataSource,
  ) {
    super();
  }

  async process(job: Job<FundWalletType, any, string>) {
    try {
      const data = job.data;
      if (job.name === WalletActionTypes.FUND_WALLET) {
        //find the wallet to debit
        const fromWallet = await this.subWalletRepo.findOneBy({
          walletnumber: data.fromWalletNumber,
          deleted: false,
        });
        //find the wallet to credit
        const toWallet = await this.subWalletRepo.findOneBy({
          id: data.subWalletId,
          deleted: false,
        });

        //check if the wallets exist otherwise, throw error
        if (!fromWallet || !toWallet) {
          this.logger.warn('Invalid from/to wallet');
          return;
        }

        //retrieve fx rates from redis or refetch
        const fxRates = await this.ratesService.retrieveFXRate(
          toWallet.currency,
        );
        const rate = fxRates?.conversion_rates?.[fromWallet.currency];
        if (!rate) {
          this.logger.warn(
            `No FX rate from ${fromWallet.currency} to ${toWallet.currency}`,
          );
          return;
        }

        //convert amount based on fx reate
        const convertedAmount = data.amount * Number(rate);
        if (convertedAmount > Number(fromWallet.balance)) {
          this.logger.warn('Insufficient balance');
          return;
        }

        //start transaction to debit from fromWallet and credit to toWallet
        //create transaction record
        //update the balance of the wallets
        //save the transaction
        //this ensures locking and a graceful failure rollback
        await this.dataSource.transaction(async (manager) => {
          fromWallet.balance = `${Number(fromWallet.balance) - convertedAmount}`;
          toWallet.balance = `${Number(toWallet.balance) + data.amount}`;
          const transaction = manager.create(Transactions, {
            amount: `${data.amount}`,
            destinationwallet: toWallet,
            sourcewallet: fromWallet,
            status: TransactionStatus.success,
            userid: fromWallet.userid,
            reference: new Date().getTime().toString(),
            type: data.transactionType,
            rate,
            currency:
              `${fromWallet.currency}/${toWallet.currency}`.toUpperCase(),
          });
          await manager.save([fromWallet, toWallet, transaction]);
        });

        this.logger.log(
          `Transferred ${toWallet.currency}${data.amount} to SubWallet ${toWallet.id}`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to process wallet funding job', error.stack);
    }
  }
}
