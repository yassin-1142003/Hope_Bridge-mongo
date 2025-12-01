import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class RateLimitMiddleware implements NestMiddleware {
    private store;
    private readonly maxRequests;
    private readonly windowMs;
    constructor();
    use(req: Request, res: Response, next: NextFunction): void;
    private getKey;
}
