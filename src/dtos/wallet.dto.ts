import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDecimal,
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class FundWalletDto {
  @ApiProperty({
    name: 'from',
    type: 'string',
    description: 'Wallet to debit',
  })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({
    name: 'to',
    type: 'string',
    description: 'Wallet to credit',
  })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    name: 'amount',
    type: 'number',
    description: 'amount to fund in the receiving wallet currency',
  })
  @IsDecimal()
  @IsOptional()
  amount: number;
}

export class GenerateWalletDto {
  @ApiProperty({
    name: 'currency',
    type: 'string',
    description:
      'ISO4217 representation of currency for which wallet is to be generated for.',
    examples: ['USD', 'NGN', 'GBP'],
  })
  @IsISO4217CurrencyCode()
  @IsNotEmpty()
  currency: string;

  @ApiPropertyOptional({
    name: 'initialbalance',
    type: 'number',
    description:
      'Initial amount in the wallet currency to fund generated wallet with',
  })
  @IsDecimal()
  @IsOptional()
  initialbalance: number;

  @ApiPropertyOptional({
    name: 'subwallet',
    type: 'string',
    description: 'Sub wallet to fund new wallet from',
  })
  @IsString()
  @IsOptional()
  subwallet: string;
}

export class ConvertCurrenciesDto {
  @ApiProperty({
    name: 'amount',
    type: 'number',
    description:
      'Amount in the currency to convert from or in currency to trade',
  })
  @IsDecimal()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    name: 'from',
    type: 'string',
    description:
      'ISO4217 representation of currency you want to convert/trade from.',
    examples: ['USD', 'NGN', 'GBP'],
  })
  @IsISO4217CurrencyCode()
  @IsNotEmpty()
  from: string;

  @ApiProperty({
    name: 'to',
    type: 'string',
    description:
      'ISO4217 representation of currency you want to convert/trade to.',
    examples: ['USD', 'NGN', 'GBP'],
  })
  @IsISO4217CurrencyCode()
  @IsNotEmpty()
  to: string;
}
