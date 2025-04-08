import { Module } from '@nestjs/common';
import { FxService } from './fx.service';
import { FxController } from './fx.controller';
import { RatesService } from 'src/wallets/rates.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '@entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  providers: [FxService, RatesService],
  controllers: [FxController],
})
export class FxModule {}
