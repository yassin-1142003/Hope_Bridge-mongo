import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class PerformanceMiddleware implements NestMiddleware {
    private static logger;
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare class RequestIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare class MemoryUsageMiddleware implements NestMiddleware {
    private readonly logger;
    private lastLog;
    private readonly logInterval;
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare class DatabasePerformanceMiddleware implements NestMiddleware {
    private readonly logger;
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare class CacheControlMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare class CustomRateLimitMiddleware implements NestMiddleware {
    private readonly logger;
    private readonly requests;
    private readonly windowMs;
    private readonly maxRequests;
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare class SecurityHeadersMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare class CompressionMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare class HealthCheckMiddleware implements NestMiddleware {
    private readonly logger;
    private readonly startTime;
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare class ApiDocsMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
