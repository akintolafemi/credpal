import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { StatusText } from 'src/types/response.manager.utils';

@Injectable()
export default class MainGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (!request.headers.authorization)
      throw new HttpException(
        {
          message: 'Authorization required to access endpoint',
          status: StatusText.UNAUTHORIZED,
          code: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );

    const token = request.headers.authorization.split(' ')[1];
    if (!token || token !== `${process.env.DEFAULT_TOKEN}`) {
      throw new HttpException(
        {
          message: 'Invalid authorization token',
          status: StatusText.UNAUTHORIZED,
          code: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return true;
  }
}
