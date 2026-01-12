import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggingService } from '../logging/logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggingService) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userAgent = request.get('user-agent') || '';
    const { ip, method, path: url, body } = request;
    
    // Mask sensitive fields in body if needed (e.g., password)
    const sanitizedBody = { ...body };
    if (sanitizedBody.password) sanitizedBody.password = '***';

    this.logger.log({
      type: 'REQUEST',
      method,
      url,
      body: sanitizedBody,
      ip,
      userAgent,
    });

    const now = Date.now();
    return next.handle().pipe(
      tap((responseBody) => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const delay = Date.now() - now;

        this.logger.log({
          type: 'RESPONSE',
          method,
          url,
          statusCode,
          duration: `${delay}ms`,
          // responseBody // Optional: Log response body (be careful with size)
        });
      }),
    );
  }
}
