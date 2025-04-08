import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

import { fetchFXRates } from '@utils/fx.utils';

export class RatesService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async retrieveFXRate(currency: string) {
    const cacheKey = `${currency}-fx-rates`;
    let fxRates = await this.cacheManager.get<any>(cacheKey);
    if (!fxRates) {
      fxRates = await fetchFXRates(currency);
      await this.cacheManager.set(cacheKey, fxRates); // Set TTL if needed
    }
    return fxRates;
  }
}
