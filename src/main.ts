import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as morgan from 'morgan';
import { Logger } from '@nestjs/common';
import { SwaggerSetup } from './utils/swagger-setup';

const API_VERSION = process.env.API_VERSION || 'api/v1';

const logStream = fs.createWriteStream('api.log', {
  flags: 'a',
});

async function bootstrap() {
  const logger = new Logger();
  const globalPrefix = API_VERSION;
  //const is_debug = process.env.DEBUG;
  const docPath = `${globalPrefix}/docs`;
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(globalPrefix);
  SwaggerSetup.setup(app, docPath);
  app.useLogger(morgan('combined', { stream: logStream }));
  app.enableCors();
  await app.listen(process.env.PORT || 3000);
  const swaggerUrl = `${await app.getUrl()}/${docPath}`;
  logger.log(`Swagger documentation is available at: ${swaggerUrl}`);
  console.log(`Swagger documentation is available at: ${swaggerUrl}`);
}

bootstrap();
