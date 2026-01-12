import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggingService } from '../logging/logging.service';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggingService) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Generate unique request ID for tracing
    const requestId = this.logger.generateRequestId();

    // Extract client info
    const userAgent = request.get('user-agent') || '';
    const ipAddress = this.getClientIp(request);
    const { method, path: url, body } = request;

    // Get user ID from request if available (from auth middleware)
    const userId = (request as any).user?.id || (request as any).userId;
    const sessionId = request.cookies?.sessionId || request.get('x-session-id');

    // Mask sensitive fields in body
    const sanitizedBody = this.sanitizeBody({ ...body });

    // Log incoming request
    this.logger.logHttp('request', {
      method,
      url,
      body: sanitizedBody,
    }, {
      requestId,
      ipAddress,
      userAgent,
      httpMethod: method,
      httpPath: url,
      userId,
      sessionId,
    });

    const now = Date.now();

    return next.handle().pipe(
      tap((responseBody) => {
        const { statusCode } = response;
        const duration = Date.now() - now;

        // Log outgoing response
        this.logger.logHttp('response', {
          method,
          url,
          statusCode,
          duration: `${duration}ms`,
        }, {
          requestId,
          ipAddress,
          userAgent,
          httpMethod: method,
          httpPath: url,
          httpStatus: statusCode,
          durationMs: duration,
          userId,
          sessionId,
        });

        // Log performance warning if request is slow (> 3 seconds)
        if (duration > 3000) {
          this.logger.logPerformance(
            `Slow request: ${method} ${url}`,
            duration,
            { requestId, httpMethod: method, httpPath: url },
          );
        }
      }),
    );
  }

  /**
   * Extract real client IP address (considering proxies)
   */
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

  /**
   * Remove sensitive fields from request body before logging
   */
  private sanitizeBody(body: Record<string, any>): Record<string, any> {
    const sensitiveFields = [
      'password',
      'passwordConfirm',
      'currentPassword',
      'newPassword',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      'creditCard',
      'cardNumber',
      'cvv',
      'ssn',
    ];

    const sanitized = { ...body };
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    }
    return sanitized;
  }
}
