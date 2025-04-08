import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiTags,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/guards/roles.guards';
import { TransactionsService } from './transactions.service';
import { AccountType } from 'src/types/request.with.user.type';
import { Roles } from 'src/decorators/roles.decorators';

@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Invalid authorization token',
})
@ApiTags('Transactions')
@UseGuards(RolesGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @ApiQuery({
    name: 'walletnumber',
    required: false,
    description: 'wallet number to fetch transactions for',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @Roles([AccountType.sysadmin, AccountType.user])
  @Get(``)
  public fetchTransactions(@Query('walletnumber') req: string) {
    return this.service.fetchTransactions(req);
  }
}
