import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor() {
    this.maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '100');
    this.windowMs = parseInt(process.env.RATE_LIMIT_WINDOW || '60000'); // 1 minute
  }

  use(req: Request, res: Response, next: NextFunction) {
    const key = this.getKey(req);
    const now = Date.now();
    const record = this.store[key];

    if (!record || now > record.resetTime) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      return next();
    }

    if (record.count >= this.maxRequests) {
      throw new HttpException(
        'Too many requests, please try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;
    next();
  }

  private getKey(req: Request): string {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    return `${ip}:${userAgent}`;
  }
}
