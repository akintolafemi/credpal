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

  //DELETE OTPS AFTER 5 MINUTES
  @Cron(CronExpression.EVERY_MINUTE)
  async DeleteOTP() {
    try {
      const fiveMinsAgo = moment().utc(true).subtract(5, 'minutes').toDate();
      await this.codesRepository.delete({
        createdat: LessThanOrEqual(fiveMinsAgo),
      });
    } catch (error) {
      console.log(error);
    }
  }
}
