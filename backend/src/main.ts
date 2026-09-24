import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { createLogger } from './logger/create-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const config = app.get(ConfigService);

  app.useLogger(
    createLogger(process.env.LOG_FORMAT ?? config.get('LOG_FORMAT')),
  );
  app.setGlobalPrefix('api/afisha');
  app.enableCors();
  await app.listen(config.getOrThrow('PORT'));
}
bootstrap();
