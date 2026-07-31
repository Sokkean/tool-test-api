import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableCors();
  await app.listen(3002, '0.0.0.0');
}
bootstrap();
