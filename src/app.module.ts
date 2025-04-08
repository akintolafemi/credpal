import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as fs from 'fs-extra';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RouteLogger } from '@middlewares/route.logger.middleware';
import { createKeyv } from '@keyv/redis';
import { EventsModule } from './events/events.module';
import { WalletsModule } from './wallets/wallets.module';
import { CronjobsModule } from './cronjobs/cronjobs.module';
import { FxModule } from './fx/fx.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot({}),
    CacheModule.register({
      ttl: 60 * 1000,
      isGlobal: true,
      stores: [
        createKeyv(
          `redis://${process.env.BULL_MQ_HOST}:${process.env.BULL_MQ_PORT}`,
        ),
      ],
    }),
    ScheduleModule.forRoot(),
    EventsModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development',
    }),
    JwtModule.register({
      global: true,
      privateKey: fs.readFileSync(`./certs/jwt.private.pem`),
      publicKey: fs.readFileSync(`./certs/jwt.public.pem`),
      signOptions: {
        algorithm: 'RS256',
        issuer: `${process.env.JWT_ISSUER}`,
        subject: `${process.env.JWT_ISSUER}`,
        audience: `${process.env.JWT_AUDIENCE}`,
        expiresIn: '60m',
      },
    }),
    AuthModule,
    WalletsModule,
    CronjobsModule,
    FxModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(RouteLogger).forRoutes('{*path}');
  }
}
