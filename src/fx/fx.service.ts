import { HttpStatus, Injectable } from '@nestjs/common';
import { ResponseManager, StatusText } from 'src/types/response.manager.utils';
import { RatesService } from 'src/wallets/rates.service';

@Injectable()
export class FxService {
  constructor(private ratesService: RatesService) {}

  async getRates(currency: string) {
    const data = await this.ratesService.retrieveFXRate(currency);
    return ResponseManager.standardResponse({
      //send out response if everything works well
      message: `Rates for ${currency} returned`,
      code: HttpStatus.OK,
      status: StatusText.OK,
      data,
    });
  }
}
