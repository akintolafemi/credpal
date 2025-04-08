import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppOptions, ValidationPipesOptions } from './utils/app.utils';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    AppOptions,
  );

  app.use(helmet());

  app.setGlobalPrefix('/api/v1'); //add versioning prefix to all API endpoints

  app.useGlobalPipes(new ValidationPipe(ValidationPipesOptions));

  const logger = new Logger(NestApplication.name); //create app logger

  //create swagger documentation configuration
  const config = new DocumentBuilder()
    .setTitle('CredPal FX')
    .setDescription('API documentation for CredPal FX Trading App')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      bearerFormat: 'JWT',
      name: 'authorization',
      scheme: 'bearer',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, documentFactory);

  const port = process.env.PORT;
  await app.listen(`${port}`, () => {
    logger.log(`Server is now listening on port ${port}`);
  });
}
void bootstrap();
