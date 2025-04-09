import {
  BadRequestException,
  NestApplicationOptions,
  ValidationError,
  ValidationPipeOptions,
} from '@nestjs/common';
import { StatusText } from 'src/types/response.manager.utils';

export const AppOptions: NestApplicationOptions = {
  rawBody: true,
  cors: {
    //set allowed method types
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  },
};

export const ValidationPipesOptions: ValidationPipeOptions = {
  whitelist: true,
  transform: true,
  exceptionFactory: (errors: ValidationError[]) => {
    return new BadRequestException({
      status: StatusText.BAD_REQUEST,
      code: 400,
      //try to get the first validated error message thrown by class-validator/class-transformer
      message:
        errors[0]?.children[0]?.children[0]?.children[0]?.children[0]
          ?.constraints[
          Object.keys(
            errors[0]?.children[0]?.children[0]?.children[0]?.children[0]
              ?.constraints,
          )[0]
        ] ||
        errors[0]?.children[0]?.children[0]?.constraints[
          Object?.keys(errors[0]?.children[0]?.children[0]?.constraints)[0]
        ] ||
        errors[0]?.children[0]?.constraints[
          Object?.keys(errors[0]?.children[0]?.constraints)[0]
        ] ||
        errors[0]?.constraints[Object?.keys(errors[0]?.constraints)[0]] ||
        'Unable to validate request',
    });
  },
};
