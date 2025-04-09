import { VerificationCodes } from '@entities/code.entity';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { LessThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class CronjobsService {
  constructor(
    //inject verification_codes repository into current class
    @InjectRepository(VerificationCodes)
    private codesRepository: Repository<VerificationCodes>,
  ) {}

  //DELETE OTPS AFTER 10 MINUTES
  @Cron(CronExpression.EVERY_10_MINUTES)
  async DeleteOTP() {
    try {
      const tenMinsAgo = moment().utc(true).subtract(10, 'minutes').toDate();
      await this.codesRepository.delete({
        createdat: LessThanOrEqual(tenMinsAgo),
      });
    } catch (error) {
      console.log(error);
    }
  }
}
