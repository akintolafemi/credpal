import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

import { fetchFXRates } from '@utils/fx.utils';

export class RatesService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  //method to fetch fx rate
  async retrieveFXRate(currency: string) {
    //redis key for saved fx rate of the currency
    const cacheKey = `${currency}-fx-rates`;
    //find the saved fx rate in redis
    //if not found, fetch from api and save to redis
    //return the fx rate
    let fxRates = await this.cacheManager.get<any>(cacheKey);
    if (!fxRates) {
      fxRates = await fetchFXRates(currency);
      await this.cacheManager.set(cacheKey, fxRates);
    }
    return fxRates;
  }
}
