import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  private static logger = new Logger(PerformanceMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const originalSend = res.send;

    // Override res.send to capture response time
    res.send = function (this: Response, body: any) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Log performance metrics
      const logData = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: (req as any).user?.id || 'anonymous',
        timestamp: new Date().toISOString(),
      };

      // Log slow requests (> 1000ms)
      if (responseTime > 1000) {
        PerformanceMiddleware.logger.warn(`Slow request detected: ${req.method} ${req.originalUrl} - ${responseTime}ms`, logData);
      } else {
        PerformanceMiddleware.logger.log(`Request completed: ${req.method} ${req.originalUrl} - ${responseTime}ms`, logData);
      }

      // Add performance headers
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      res.setHeader('X-Request-ID', (req as any).id || 'unknown');

      return originalSend.call(this, body);
    };

    next();
  }
}

/**
 * Request ID Middleware
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    (req as any).id = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  }
}

/**
 * Memory Usage Middleware
 */
@Injectable()
export class MemoryUsageMiddleware implements NestMiddleware {
  private readonly logger = new Logger(MemoryUsageMiddleware.name);
  private lastLog = 0;
  private readonly logInterval = 60000; // Log every minute

  use(req: Request, res: Response, next: NextFunction) {
    const now = Date.now();
    
    if (now - this.lastLog > this.logInterval) {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      this.logger.log('Memory Usage', {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
        uptime: `${Math.round(process.uptime())}s`,
        timestamp: new Date().toISOString(),
      });
      
      this.lastLog = now;
    }
    
    next();
  }
}

/**
 * Database Query Performance Middleware
 */
@Injectable()
export class DatabasePerformanceMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DatabasePerformanceMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // This would be integrated with Mongoose middleware
    // For now, we'll just log the request
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      if (duration > 500) {
        this.logger.warn(`Slow database operation detected: ${req.method} ${req.originalUrl} - ${duration}ms`, {
          method: req.method,
          url: req.originalUrl,
          duration,
          userId: (req as any).user?.id || 'anonymous',
        });
      }
    });
    
    next();
  }
}

/**
 * Cache Control Middleware
 */
@Injectable()
export class CacheControlMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Set cache control headers based on route
    const url = req.originalUrl;
    
    if (url.includes('/api/projects/featured') || url.includes('/api/statistics')) {
      // Cache for 5 minutes
      res.setHeader('Cache-Control', 'public, max-age=300');
    } else if (url.includes('/api/projects') && req.method === 'GET') {
      // Cache for 2 minutes
      res.setHeader('Cache-Control', 'public, max-age=120');
    } else if (url.includes('/images/') || url.includes('/assets/')) {
      // Cache static assets for 1 day
      res.setHeader('Cache-Control', 'public, max-age=86400');
    } else {
      // No caching for dynamic content
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    
    next();
  }
}

/**
 * Rate Limiting Middleware
 */
@Injectable()
export class CustomRateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CustomRateLimitMiddleware.name);
  private readonly requests = new Map<string, { count: number; resetTime: number }>();
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly maxRequests = 100;

  use(req: Request, res: Response, next: NextFunction) {
    const clientId = req.ip || req.get('X-Forwarded-For') || 'unknown';
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean up old entries
    for (const [id, data] of this.requests.entries()) {
      if (data.resetTime < now) {
        this.requests.delete(id);
      }
    }

    // Get or create client data
    let clientData = this.requests.get(clientId);
    if (!clientData || clientData.resetTime < now) {
      clientData = { count: 0, resetTime: now + this.windowMs };
      this.requests.set(clientId, clientData);
    }

    // Check rate limit
    if (clientData.count >= this.maxRequests) {
      this.logger.warn(`Rate limit exceeded for ${clientId}`, {
        ip: clientId,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
      });

      res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((clientData.resetTime - now) / 1000)} seconds.`,
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
      });
      return;
    }

    // Increment counter
    clientData.count++;

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - clientData.count));
    res.setHeader('X-RateLimit-Reset', new Date(clientData.resetTime).toISOString());

    next();
  }
}

/**
 * Security Headers Middleware
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: http:",
      "connect-src 'self' https://api.stripe.com https://js.stripe.com",
      "frame-src 'none'",
    ].join('; ');
    
    res.setHeader('Content-Security-Policy', csp);
    
    next();
  }
}

/**
 * Compression Middleware (simplified version)
 */
@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const acceptEncoding = req.get('Accept-Encoding') || '';
    
    if (acceptEncoding.includes('gzip')) {
      res.setHeader('Content-Encoding', 'gzip');
    } else if (acceptEncoding.includes('deflate')) {
      res.setHeader('Content-Encoding', 'deflate');
    }
    
    next();
  }
}

/**
 * Health Check Middleware
 */
@Injectable()
export class HealthCheckMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HealthCheckMiddleware.name);
  private readonly startTime = Date.now();

  use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl === '/health') {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        startTime: new Date(this.startTime).toISOString(),
      };

      res.status(200).json({
        success: true,
        data: health,
      });
      return;
    }
    
    next();
  }
}

/**
 * API Documentation Middleware
 */
@Injectable()
export class ApiDocsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl === '/api-docs') {
      const docs = {
        title: 'Charity Backend API',
        version: '2.0.0',
        description: 'Enhanced charity management system API',
        baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
        endpoints: {
          projects: {
            'GET /projects': 'List all projects',
            'POST /projects': 'Create new project',
            'GET /projects/:id': 'Get project details',
            'PUT /projects/:id': 'Update project',
            'DELETE /projects/:id': 'Delete project',
            'GET /projects/featured': 'Get featured projects',
            'GET /projects/nearby': 'Get nearby projects',
            'POST /projects/:id/volunteer': 'Volunteer for project',
            'POST /projects/:id/donate': 'Donate to project',
          },
          users: {
            'GET /users': 'List users',
            'POST /users': 'Create user',
            'GET /users/:id': 'Get user details',
            'PUT /users/:id': 'Update user',
          },
          donations: {
            'GET /donations': 'List donations',
            'POST /donations': 'Create donation',
            'GET /donations/:id': 'Get donation details',
          },
          tasks: {
            'GET /tasks': 'List tasks',
            'POST /tasks': 'Create task',
            'GET /tasks/:id': 'Get task details',
            'PUT /tasks/:id': 'Update task',
          },
        },
        authentication: {
          type: 'JWT',
          bearerFormat: 'JWT',
        },
        generatedAt: new Date().toISOString(),
      };

      res.status(200).json({
        success: true,
        data: docs,
      });
      return;
    }
    
    next();
  }
}
