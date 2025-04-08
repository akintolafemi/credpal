import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class EmailDto {
  @ApiProperty({
    name: 'email',
    type: 'string',
  })
  @IsEmail(
    {},
    {
      message: 'invalid email address',
    },
  )
  @IsNotEmpty()
  email: string;
}

export class CreateUserDto extends EmailDto {
  @ApiProperty({
    name: 'password',
    type: 'string',
    example: '1234ASdf@',
    description:
      'password must be at least 8 characters long, has at least 1 uppercase, 1 lowercase, 1 number and 1 special character',
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @IsNotEmpty()
  password: string;
}

export class VerifyOTPDto extends EmailDto {
  @ApiProperty({
    name: 'code',
    description: "code sent to user's email address",
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
