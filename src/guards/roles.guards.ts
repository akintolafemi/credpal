import { Users } from '@entities/user.entity';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from 'src/decorators/roles.decorators';
import { StatusText } from 'src/types/response.manager.utils';
import { Repository } from 'typeorm';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
    //inject users repository into current class
    @InjectRepository(Users) private usersRepository: Repository<Users>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const roles = this.reflector.get(Roles, context.getHandler());
      if (!roles) {
        throw new HttpException(
          {
            message: 'Role permission needed to access this route',
            status: StatusText.UNAUTHORIZED,
            code: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      //check if auth header exists
      if (!request.headers.authorization) {
        throw new HttpException(
          {
            message: 'Authorization token not found',
            status: StatusText.UNAUTHORIZED,
            code: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      //get token from reques, verifiedToken
      const token = request.headers.authorization.split(' ')[1];
      if (!token) {
        throw new HttpException(
          {
            message: 'Invalid authorization token',
            status: StatusText.UNAUTHORIZED,
            code: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      //decode token
      const verifiedToken = this.jwtService.verify(token);

      //get user
      const user = await this.usersRepository.findOneBy({
        id: verifiedToken?.id,
        deleted: false,
      });

      if (!user) {
        throw new HttpException(
          {
            message: 'Failed to verify user or user no longer exist',
            status: StatusText.UNAUTHORIZED,
            code: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!user.verified) {
        throw new HttpException(
          {
            message: 'Account is not active',
            status: StatusText.FORBIDDEN,
            code: HttpStatus.FORBIDDEN,
          },
          HttpStatus.FORBIDDEN,
        );
      }

      if (!roles.includes(user.accounttype)) {
        throw new HttpException(
          {
            message: 'User does not have access to this resource',
            status: StatusText.FORBIDDEN,
            code: HttpStatus.FORBIDDEN,
          },
          HttpStatus.FORBIDDEN,
        );
      }

      //attach user to request
      request['user'] = user;
      request['token'] = token;

      return true;
    } catch (error) {
      if (
        error?.name === 'TokenExpiredError' ||
        error?.name === 'JsonWebTokenError'
      ) {
        throw new HttpException(
          {
            message:
              error?.name === 'TokenExpiredError'
                ? 'Token Expired'
                : 'Invalid Token',
            status: StatusText.UNAUTHORIZED,
            code: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw new HttpException(
        {
          data: error,
          message: error?.message || 'Authorization failed',
          status: error?.response?.status || StatusText.ERROR,
          code: error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        },
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
