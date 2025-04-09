import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiTags,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { RolesGuard } from 'src/guards/roles.guards';
import { Roles } from 'src/decorators/roles.decorators';
import { AccountType } from 'src/types/request.with.user.type';
import {
  ConvertCurrenciesDto,
  FundWalletDto,
  GenerateWalletDto,
} from '@dtos/wallet.dto';

@ApiBearerAuth()
@ApiBadRequestResponse({
  description: 'Incorrect request body',
})
@ApiUnauthorizedResponse({
  description: 'Invalid authorization token',
})
@ApiTags('Wallets')
@UseGuards(RolesGuard)
@Controller('wallets')
export class WalletsController {
  //inject walletservice
  constructor(private readonly service: WalletsService) {}

  @ApiOkResponse({
    description: 'Success',
  })
  @Roles([AccountType.sysadmin, AccountType.user])
  @Post(`/generate`)
  public generateNewWallet(@Body() req: GenerateWalletDto) {
    return this.service.generateNewWallet(req);
  }

  @ApiOkResponse({
    description: 'Success',
  })
  @Roles([AccountType.sysadmin, AccountType.user])
  @Post(`/fund`)
  public fundWallet(@Body() req: FundWalletDto) {
    return this.service.fundWallet(req);
  }

  @ApiOkResponse({
    description: 'Success',
  })
  @Roles([AccountType.sysadmin, AccountType.user])
  @Post(`/trade`)
  public trade(@Body() req: ConvertCurrenciesDto) {
    return this.service.trade(req);
  }

  @ApiOkResponse({
    description: 'Success',
  })
  @Roles([AccountType.sysadmin, AccountType.user])
  @Post(`/convert`)
  public convert(@Body() req: ConvertCurrenciesDto) {
    return this.service.convert(req);
  }

  @ApiQuery({
    required: false,
    type: 'string',
    name: 'currency',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @Roles([AccountType.sysadmin, AccountType.user])
  @Get(``)
  public fetchWallets(@Query('currency') currency: string) {
    return this.service.fetchWallets(currency);
  }
}
