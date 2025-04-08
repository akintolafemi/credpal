import { Reflector } from '@nestjs/core';
import { AccountTypes } from 'src/types/request.with.user.type';

export const Roles = Reflector.createDecorator<typeof AccountTypes>();
