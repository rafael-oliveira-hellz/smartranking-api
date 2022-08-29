import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import * as momentTimezone from 'moment-timezone';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new LoggingInterceptor(), new TimeoutInterceptor())
  app.useGlobalFilters(new AllExceptionsFilter());

  Date.prototype.toJSON = function () {
    return momentTimezone(this)
      .tz('America/Sao_Paulo')
      .format('DD-MM-YYYY HH:mm:ss.SSS');
  };

  await app.listen(8080);
}

bootstrap();
