import { VerificationCodes } from '@entities/code.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { generateOTP, generateWalletNumber } from '@utils/strings.utils';
import {
  EmailNotificationData,
  EventType,
  NotificationType,
  SendAccountVerificationData,
} from 'src/types/events.types';
import { Repository } from 'typeorm';
import { sendEmailNotification } from '@utils/notification.utils';
import { AuditLogs } from '@entities/audit.entity';
import { Wallets } from '@entities/wallet.entity';
import { Users } from '@entities/user.entity';

@Injectable()
export class EventsService {
  constructor(
    //inject verification_codes repository into current class
    @InjectRepository(VerificationCodes)
    private codesRepository: Repository<VerificationCodes>,
    //inject audit_logs repository into current class
    @InjectRepository(AuditLogs)
    private auditRepository: Repository<AuditLogs>,
    //inject wallets repository into current class
    @InjectRepository(Wallets)
    private walletRepository: Repository<Wallets>,
    //inject wallets repository into current class
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  @OnEvent(EventType.AUDIT_LOG)
  async audiLog(data: AuditLogs) {
    try {
      await this.auditRepository.save({
        ...data,
      });
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent(EventType.SEND_EMAIL)
  async sendEmail(data: EmailNotificationData) {
    try {
      const req = await sendEmailNotification(data);
      return req;
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent(EventType.SEND_OTP)
  async sendVerificationOtp(data: SendAccountVerificationData) {
    try {
      const code = generateOTP();
      const create = await this.codesRepository.save({
        code: `${code}`,
        email: data.email,
      });
      if (create) {
        //send otp
        await this.sendEmail({
          email: data.email,
          type: NotificationType.VERIFY_ACCOUNT,
          code: `${code}`,
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent(EventType.ACCOUNT_VERIFIED)
  async accountVerified(email: string) {
    try {
      const user = await this.userRepository.findOneBy({
        email,
        deleted: false,
      });
      if (!user) return;
      const walletNumber = generateWalletNumber();
      const subWalletAccountNumber = generateWalletNumber();
      await this.walletRepository.save({
        walletnumber: walletNumber,
        userid: user.id,
        subwallets: [
          {
            userid: user.id,
            walletnumber: subWalletAccountNumber,
          },
        ],
      });
    } catch (e) {
      console.log(e);
    }
  }
}
