import {
  ConvertCurrenciesDto,
  FundWalletDto,
  GenerateWalletDto,
} from '@dtos/wallet.dto';
import { SubWallets } from '@entities/subwallet.entity';
import { Wallets } from '@entities/wallet.entity';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { generateWalletNumber } from '@utils/strings.utils';
import { BullMQQueueType } from 'src/types/bullmq.types';
import RequestWithUser from 'src/types/request.with.user.type';
import {
  ResponseManager,
  standardResponse,
  StatusText,
} from 'src/types/response.manager.utils';
import { Repository } from 'typeorm';
import {
  FundWalletType,
  TransactionType,
  WalletActionTypes,
} from 'src/types/wallet.types';
import { RatesService } from './rates.service';

@Injectable()
export class WalletsService {
  //inject dependecies
  constructor(
    private ratesService: RatesService,
    //inject current request
    @Inject(REQUEST) private request: RequestWithUser,
    //inject wallets repository into current class
    @InjectRepository(Wallets)
    private walletRepository: Repository<Wallets>,
    //inject sub_wallets repository into current class
    @InjectRepository(SubWallets)
    private subWalletRepository: Repository<SubWallets>,
    @InjectQueue(BullMQQueueType.WALLET) private walletQueue: Queue,
  ) {}

  //create a new wallet
  async generateNewWallet(req: GenerateWalletDto): Promise<standardResponse> {
    //find the main wallet for the user
    //this is the wallet that will hold aggregate of all the currencies
    //this is generated when user is verified
    const wallet = await this.walletRepository.findOne({
      where: {
        userid: this.request.user.id,
        deleted: false,
      },
    });
    //throw error if no wallet
    if (!wallet)
      throw new HttpException(
        {
          message: 'User main wallet not found',
          status: StatusText.NOT_FOUND,
          code: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );

    //check if user currently does not have a wallet of the same currency
    //if user has a wallet of the same currency, throw error
    //if user does not have a wallet of the same currency, create a new wallet
    const currencyWallet = await this.subWalletRepository.findOneBy({
      currency: req.currency,
      userid: this.request.user.id,
    });

    if (currencyWallet)
      throw new HttpException(
        {
          message: `Wallet type of currency ${req.currency} already exist`,
          status: StatusText.CONFLICT,
          code: HttpStatus.CONFLICT,
        },
        HttpStatus.CONFLICT,
      );

    //generate a new wallet number
    //this is a unique number that will identify the wallet
    const walletNumber = generateWalletNumber();
    const subWallet = await this.subWalletRepository.save({
      currency: req.currency,
      superwallet: wallet,
      userid: this.request.user.id,
      walletnumber: walletNumber,
    });

    //if there's subwallet in the request, fund the wallet
    if (req.subwallet) {
      const fundWallet: FundWalletType = {
        subWalletId: subWallet.id,
        fromWalletNumber: req.subwallet,
        amount: req.initialbalance,
        transactionType: TransactionType.fund,
      };

      //create a job to fund the wallet
      //this will be processed in the background
      await this.walletQueue.add(WalletActionTypes.FUND_WALLET, fundWallet, {
        jobId: `debit:${req.subwallet}`,
        removeOnComplete: true,
      });
    }

    return ResponseManager.standardResponse({
      //send out response if everything works well
      message: `${req.currency} wallet generated successfully!`,
      code: HttpStatus.OK,
      status: StatusText.OK,
    });
  }

  async getRates(currency: string) {
    const data = await this.ratesService.retrieveFXRate(currency);
    return ResponseManager.standardResponse({
      //send out response if everything works well
      message: `Rates for ${currency} returned`,
      code: HttpStatus.OK,
      status: StatusText.OK,
      data,
    });
  }

  //trade currencies
  async trade(req: ConvertCurrenciesDto) {
    //find wallet of the currency to trade from
    const fromWallet = await this.subWalletRepository.findOneBy({
      currency: req.from,
      deleted: false,
      userid: this.request.user.id,
    });
    //throw error if not found
    if (!fromWallet)
      throw new HttpException(
        {
          message: 'Wallet to trade from not found',
          status: StatusText.NOT_FOUND,
          code: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    //find wallet of the currency to trade to
    //throw error if not found
    const to = await this.subWalletRepository.findOneBy({
      currency: req.to,
      deleted: false,
      userid: this.request.user.id,
    });
    if (!to)
      throw new HttpException(
        {
          message: 'Wallet to trade with not found',
          status: StatusText.NOT_FOUND,
          code: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    const fundWallet: FundWalletType = {
      subWalletId: to.id,
      fromWalletNumber: fromWallet.walletnumber,
      amount: Number(req.amount),
      transactionType: TransactionType.trade,
    };

    //create a job to fund the wallet
    //this will be processed in the background
    await this.walletQueue.add(WalletActionTypes.FUND_WALLET, fundWallet, {
      jobId: `debit:${fromWallet.walletnumber}`,
      removeOnComplete: true,
    });

    return ResponseManager.standardResponse({
      //send out response if everything works well
      message: `Trade in progress`,
      code: HttpStatus.OK,
      status: StatusText.OK,
    });
  }

  async convert(req: ConvertCurrenciesDto) {
    const from = await this.ratesService.retrieveFXRate(req.from);
    const rate = from?.conversion_rates?.[req.to];
    if (!rate)
      throw new HttpException(
        {
          message: `No FX rate from ${req.from} to ${req.to}`,
          status: StatusText.CONFLICT,
          code: HttpStatus.CONFLICT,
        },
        HttpStatus.CONFLICT,
      );

    const convertedAmount = Number(req.amount) * Number(rate);

    return ResponseManager.standardResponse({
      //send out response if everything works well
      message: `Currency conversion rates returned`,
      code: HttpStatus.OK,
      status: StatusText.OK,
      data: {
        request: req,
        value: convertedAmount,
        rate: rate,
      },
    });
  }

  async fundWallet(req: FundWalletDto) {
    const fromWallet = await this.subWalletRepository.findOneBy({
      walletnumber: req.from,
      deleted: false,
      userid: this.request.user.id,
    });
    if (!fromWallet)
      throw new HttpException(
        {
          message: 'Wallet to debit not found',
          status: StatusText.NOT_FOUND,
          code: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    const to = await this.subWalletRepository.findOneBy({
      walletnumber: req.to,
      deleted: false,
      userid: this.request.user.id,
    });
    if (!to)
      throw new HttpException(
        {
          message: 'Wallet to credit not found',
          status: StatusText.NOT_FOUND,
          code: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    const fundWallet: FundWalletType = {
      subWalletId: to.id,
      fromWalletNumber: fromWallet.walletnumber,
      amount: Number(req.amount),
      transactionType: TransactionType.fund,
    };

    await this.walletQueue.add(WalletActionTypes.FUND_WALLET, fundWallet, {
      jobId: `debit:${fromWallet.walletnumber}`,
      removeOnComplete: true,
    });

    return ResponseManager.standardResponse({
      //send out response if everything works well
      message: `Funding in progress`,
      code: HttpStatus.OK,
      status: StatusText.OK,
    });
  }

  async fetchWallets(currency?: string) {
    const wallets = await this.subWalletRepository.find({
      where: {
        userid: this.request.user.id,
        currency,
        deleted: false,
      },
    });

    return ResponseManager.standardResponse({
      //send out response if everything works well
      message: `Wallets retrieved`,
      code: HttpStatus.OK,
      status: StatusText.OK,
      data: wallets,
    });
  }
}
