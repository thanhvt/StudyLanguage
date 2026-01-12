import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { LoggingService } from '../logging/logging.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: LoggingService,
  ) {
    this.logger.setContext('ExceptionsHandler');
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const request = ctx.getRequest();
    const response = ctx.getResponse();
    
    // Attempt to get friendly error message
    let message = 'Internal server error';
    if (exception instanceof HttpException) {
        const responseData = exception.getResponse();
        if (typeof responseData === 'string') {
            message = responseData;
        } else if (typeof responseData === 'object' && responseData !== null && 'message' in responseData) {
            message = (responseData as any).message;
        }
    } else if (exception instanceof Error) {
        message = exception.message;
    }


    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      message,
    };

    // Log the error
    this.logger.error(
      {
        type: 'EXCEPTION',
        status: httpStatus,
        path: responseBody.path,
        message,
        stack: exception instanceof Error ? exception.stack : undefined,
      },
      undefined,
      // Provide stack trace primarily in meta if needed, but error() usually handles it
    );
  
    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
