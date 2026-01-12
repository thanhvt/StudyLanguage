import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { LoggingService } from '../logging/logging.service';
import { Request } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: LoggingService,
  ) {
    this.logger.setContext('ExceptionsHandler');
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();

    // Determine HTTP status
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extract error message
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      const responseData = exception.getResponse();
      if (typeof responseData === 'string') {
        message = responseData;
      } else if (
        typeof responseData === 'object' &&
        responseData !== null &&
        'message' in responseData
      ) {
        message = (responseData as any).message;
      }
      errorCode = `HTTP_${httpStatus}`;
    } else if (exception instanceof Error) {
      message = exception.message;
      errorCode = exception.name || 'UNKNOWN_ERROR';
    }

    // Extract client info
    const ipAddress = this.getClientIp(request);
    const userAgent = request.get('user-agent') || '';
    const userId = (request as any).user?.id || (request as any).userId;
    const requestId =
      request.get('x-request-id') || this.logger.generateRequestId();

    // Build response body
    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      message,
      errorCode,
      requestId,
    };

    // Log the exception with detailed metadata
    this.logger.logException(exception, {
      requestId,
      ipAddress,
      userAgent,
      httpMethod: request.method,
      httpPath: httpAdapter.getRequestUrl(request),
      httpStatus,
      userId,
      errorCode,
    });

    // Log security event for auth failures
    if (httpStatus === 401 || httpStatus === 403) {
      this.logger.logSecurity(
        httpStatus === 401 ? 'auth_failure' : 'permission_denied',
        `${request.method} ${httpAdapter.getRequestUrl(request)} - ${message}`,
        {
          requestId,
          ipAddress,
          userAgent,
          httpMethod: request.method,
          httpPath: httpAdapter.getRequestUrl(request),
          userId,
        },
      );
    }

    httpAdapter.reply(response, responseBody, httpStatus);
  }

  private getClientIp(request: Request): string {
    const forwardedFor = request.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    const realIp = request.get('x-real-ip');
    if (realIp) {
      return realIp;
    }
    return request.ip || request.socket?.remoteAddress || 'unknown';
  }
}
