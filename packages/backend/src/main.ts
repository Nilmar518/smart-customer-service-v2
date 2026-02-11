import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 8080;

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  });

  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on http://0.0.0.0:${port}`);
}

bootstrap();
