import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiTags,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/guards/roles.guards';
import { Roles } from 'src/decorators/roles.decorators';
import { AccountType } from 'src/types/request.with.user.type';
import { FxService } from './fx.service';

@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Invalid authorization token',
})
@ApiTags('FX')
@UseGuards(RolesGuard)
@Controller('fx')
export class FxController {
  constructor(private readonly service: FxService) {}

  @ApiParam({
    name: 'currency',
    description: 'ISO4217 representation of currency for which rate to fetch ',
    type: 'string',
    required: true,
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @Roles([AccountType.sysadmin, AccountType.user])
  @Get(`/rates/:currency`)
  public getRates(@Param('currency') currency: string) {
    return this.service.getRates(currency);
  }
}
