import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // const message = exception.message || "Internal Server Error";
    // const errorName = exception.name || "UnknownError";
    const message =
      exception instanceof HttpException ? exception.getResponse() : exception;

    const err = {
      timestamp: new Date().toLocaleString('pt-BR'),
      path: request.url,
      error: message,
    };

    this.logger.error(err);

    response.status(status).json(err);
  }
}
