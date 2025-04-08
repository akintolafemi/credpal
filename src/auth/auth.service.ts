import { CreateUserDto, EmailDto, VerifyOTPDto } from '@dtos/auth.dto';
import { VerificationCodes } from '@entities/code.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Users } from '@entities/user.entity';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ResponseManager,
  standardResponse,
  StatusText,
} from 'src/types/response.manager.utils';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { BCRYPT_HASH_ROUNDS } from 'src/constants/app.constant';
import { EventType, SendAccountVerificationData } from 'src/types/events.types';
import { REQUEST } from '@nestjs/core';
import RequestWithUser from 'src/types/request.with.user.type';
import { AuditLogs } from '@entities/audit.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    //inject current request
    @Inject(REQUEST) private request: RequestWithUser,
    //inject users repository into current class
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    //inject verification_codes repository into current class
    @InjectRepository(VerificationCodes)
    private codesRepository: Repository<VerificationCodes>,
    private eventEmitter: EventEmitter2,
  ) {}

  async loginUser(req: CreateUserDto): Promise<standardResponse> {
    const user = await this.usersRepository.findOne({
      where: {
        email: req.email,
      },
    });
    if (!user) {
      throw new HttpException(
        {
          message: 'username does not exist',
          status: StatusText.BAD_REQUEST,
          code: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    //validate password
    const passwordsMatch = await bcrypt.compare(req.password, user.password);
    //throw error if passwords do not match
    if (!passwordsMatch) {
      throw new HttpException(
        {
          message: `Invalid password`,
          status: StatusText.BAD_REQUEST,
          code: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const log: Partial<AuditLogs> = {
      userid: user.id,
      action: 'Authentication',
      note: 'You authenticated successfully',
      ip: this.request['ip'],
      useragent: this.request.headers['user-agent'] || '',
    };
    this.eventEmitter.emit(EventType.AUDIT_LOG, log);
    delete user.password;

    const payload = {
      email: user.email,
      id: user.id,
    };
    const token = this.jwtService.sign(payload, {});
    const refreshtoken = this.jwtService.sign(payload, {
      expiresIn: '70m',
    });

    return ResponseManager.standardResponse({
      //send out response if everything works well
      message: `Sign in successful!`,
      code: HttpStatus.OK,
      status: StatusText.OK,
      data: {
        user,
        token,
        refreshtoken,
      },
    });
  }

  async registerUser(req: CreateUserDto): Promise<standardResponse> {
    const userExist = await this.usersRepository.findOne({
      where: {
        email: req.email,
      },
    });
    if (userExist)
      throw new HttpException(
        {
          message: 'email already used by another user',
          code: HttpStatus.CONFLICT,
          status: StatusText.CONFLICT,
        },
        HttpStatus.CONFLICT,
      );

    const password = await bcrypt.hash(req.password, BCRYPT_HASH_ROUNDS); //hash the password

    await this.usersRepository.save({
      email: req.email,
      password,
    });

    const verifyReq: SendAccountVerificationData = {
      email: req.email,
    };

    this.eventEmitter.emit(EventType.SEND_OTP, verifyReq);

    return ResponseManager.standardResponse({
      //send out response if everything works well
      message: `Sign up successful!`,
      code: HttpStatus.CREATED,
      status: StatusText.CREATED,
    });
  }

  async verifyOTP(req: VerifyOTPDto): Promise<standardResponse> {
    const codeExist = await this.codesRepository.findOneBy({
      email: req.email,
      code: req.code,
    });
    if (!codeExist)
      throw new HttpException(
        {
          message: 'code not found',
          code: HttpStatus.NOT_FOUND,
          status: StatusText.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );

    await this.codesRepository.delete({
      id: codeExist.id,
    });

    await this.usersRepository.update(
      {
        email: req.email,
      },
      {
        verified: true,
      },
    );

    this.eventEmitter.emit(EventType.ACCOUNT_VERIFIED, req.email);

    return ResponseManager.standardResponse({
      //send out response if everything works well
      message: `Code verification successful!`,
      code: HttpStatus.OK,
      status: StatusText.OK,
    });
  }

  async requestOTP(req: EmailDto): Promise<standardResponse> {
    const userExist = await this.usersRepository.findOne({
      where: {
        email: req.email,
      },
    });
    if (!userExist)
      throw new HttpException(
        {
          message: 'User not found',
          code: HttpStatus.NOT_FOUND,
          status: StatusText.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    const verifyReq: SendAccountVerificationData = {
      email: req.email,
    };

    this.eventEmitter.emit(EventType.SEND_OTP, verifyReq);

    return ResponseManager.standardResponse({
      //send out response if everything works well
      message: `OTP request successful!`,
      code: HttpStatus.OK,
      status: StatusText.OK,
    });
  }
}
