import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiTags,
  ApiOkResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto, VerifyOTPDto } from '@dtos/auth.dto';
import MainGuard from 'src/guards/main.guards';

@ApiBearerAuth()
@ApiBadRequestResponse({
  description: 'Incorrect request body',
})
@ApiUnauthorizedResponse({
  description: 'Invalid authorization token',
})
@ApiTags('Authentication & Onboarding')
@UseGuards(MainGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @ApiOkResponse({
    description: 'Success',
  })
  @Post(`/login`)
  public loginUser(@Body() req: CreateUserDto) {
    return this.service.loginUser(req);
  }

  @ApiCreatedResponse({
    description: 'Success',
  })
  @ApiConflictResponse({
    description: 'email already in use',
  })
  @Post(`/register`)
  public registerUser(@Body() req: CreateUserDto) {
    return this.service.registerUser(req);
  }

  @ApiOkResponse({
    description: 'Success',
  })
  @ApiNotFoundResponse({
    description: 'code not found',
  })
  @Post(`/verify`)
  public verifyOTP(@Body() req: VerifyOTPDto) {
    return this.service.verifyOTP(req);
  }
}
