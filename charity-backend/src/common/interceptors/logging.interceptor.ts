import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const now = Date.now();

    this.logger.log(
      `${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    return next.handle().pipe(
      // tap(() => {
      //   const response = context.switchToHttp().getResponse();
      //   const { statusCode } = response;
      //   const delay = Date.now() - now;
      //   this.logger.log(
      //     `${method} ${url} - ${statusCode} - ${delay}ms`,
      //   );
      // }),
    );
  }
}
