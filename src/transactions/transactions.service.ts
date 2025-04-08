import { Transactions } from '@entities/transaction.entity';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import RequestWithUser from 'src/types/request.with.user.type';
import { ResponseManager, StatusText } from 'src/types/response.manager.utils';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionsService {
  constructor(
    //inject current request
    @Inject(REQUEST) private request: RequestWithUser,
    //inject transactions repository into current class
    @InjectRepository(Transactions)
    private transactionRepository: Repository<Transactions>,
  ) {}

  async fetchTransactions(walletnumber?: string) {
    const transactions = await this.transactionRepository.find({
      where: [
        { userid: this.request.user.id, source: walletnumber },
        { userid: this.request.user.id, destination: walletnumber },
      ],
    });

    const totalItems = await this.transactionRepository.count({
      where: [
        { userid: this.request.user.id, source: walletnumber },
        { userid: this.request.user.id, destination: walletnumber },
      ],
    });

    return ResponseManager.paginatedResponse({
      //send out response if everything works well
      message: `Transactions retrieved`,
      code: HttpStatus.OK,
      status: StatusText.OK,
      data: transactions,
      meta: {
        totalItems,
      },
    });
  }
}
