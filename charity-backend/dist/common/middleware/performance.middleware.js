"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PerformanceMiddleware_1, MemoryUsageMiddleware_1, DatabasePerformanceMiddleware_1, CustomRateLimitMiddleware_1, HealthCheckMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiDocsMiddleware = exports.HealthCheckMiddleware = exports.CompressionMiddleware = exports.SecurityHeadersMiddleware = exports.CustomRateLimitMiddleware = exports.CacheControlMiddleware = exports.DatabasePerformanceMiddleware = exports.MemoryUsageMiddleware = exports.RequestIdMiddleware = exports.PerformanceMiddleware = void 0;
const common_1 = require("@nestjs/common");
let PerformanceMiddleware = PerformanceMiddleware_1 = class PerformanceMiddleware {
    use(req, res, next) {
        const startTime = Date.now();
        const originalSend = res.send;
        res.send = function (body) {
            var _a;
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            const logData = {
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                responseTime: `${responseTime}ms`,
                userAgent: req.get('User-Agent'),
                ip: req.ip,
                userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'anonymous',
                timestamp: new Date().toISOString(),
            };
            if (responseTime > 1000) {
                PerformanceMiddleware_1.logger.warn(`Slow request detected: ${req.method} ${req.originalUrl} - ${responseTime}ms`, logData);
            }
            else {
                PerformanceMiddleware_1.logger.log(`Request completed: ${req.method} ${req.originalUrl} - ${responseTime}ms`, logData);
            }
            res.setHeader('X-Response-Time', `${responseTime}ms`);
            res.setHeader('X-Request-ID', req.id || 'unknown');
            return originalSend.call(this, body);
        };
        next();
    }
};
exports.PerformanceMiddleware = PerformanceMiddleware;
PerformanceMiddleware.logger = new common_1.Logger(PerformanceMiddleware_1.name);
exports.PerformanceMiddleware = PerformanceMiddleware = PerformanceMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], PerformanceMiddleware);
let RequestIdMiddleware = class RequestIdMiddleware {
    use(req, res, next) {
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        req.id = requestId;
        res.setHeader('X-Request-ID', requestId);
        next();
    }
};
exports.RequestIdMiddleware = RequestIdMiddleware;
exports.RequestIdMiddleware = RequestIdMiddleware = __decorate([
    (0, common_1.Injectable)()
], RequestIdMiddleware);
let MemoryUsageMiddleware = MemoryUsageMiddleware_1 = class MemoryUsageMiddleware {
    constructor() {
        this.logger = new common_1.Logger(MemoryUsageMiddleware_1.name);
        this.lastLog = 0;
        this.logInterval = 60000;
    }
    use(req, res, next) {
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
};
exports.MemoryUsageMiddleware = MemoryUsageMiddleware;
exports.MemoryUsageMiddleware = MemoryUsageMiddleware = MemoryUsageMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], MemoryUsageMiddleware);
let DatabasePerformanceMiddleware = DatabasePerformanceMiddleware_1 = class DatabasePerformanceMiddleware {
    constructor() {
        this.logger = new common_1.Logger(DatabasePerformanceMiddleware_1.name);
    }
    use(req, res, next) {
        const startTime = Date.now();
        res.on('finish', () => {
            var _a;
            const duration = Date.now() - startTime;
            if (duration > 500) {
                this.logger.warn(`Slow database operation detected: ${req.method} ${req.originalUrl} - ${duration}ms`, {
                    method: req.method,
                    url: req.originalUrl,
                    duration,
                    userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'anonymous',
                });
            }
        });
        next();
    }
};
exports.DatabasePerformanceMiddleware = DatabasePerformanceMiddleware;
exports.DatabasePerformanceMiddleware = DatabasePerformanceMiddleware = DatabasePerformanceMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], DatabasePerformanceMiddleware);
let CacheControlMiddleware = class CacheControlMiddleware {
    use(req, res, next) {
        const url = req.originalUrl;
        if (url.includes('/api/projects/featured') || url.includes('/api/statistics')) {
            res.setHeader('Cache-Control', 'public, max-age=300');
        }
        else if (url.includes('/api/projects') && req.method === 'GET') {
            res.setHeader('Cache-Control', 'public, max-age=120');
        }
        else if (url.includes('/images/') || url.includes('/assets/')) {
            res.setHeader('Cache-Control', 'public, max-age=86400');
        }
        else {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
        next();
    }
};
exports.CacheControlMiddleware = CacheControlMiddleware;
exports.CacheControlMiddleware = CacheControlMiddleware = __decorate([
    (0, common_1.Injectable)()
], CacheControlMiddleware);
let CustomRateLimitMiddleware = CustomRateLimitMiddleware_1 = class CustomRateLimitMiddleware {
    constructor() {
        this.logger = new common_1.Logger(CustomRateLimitMiddleware_1.name);
        this.requests = new Map();
        this.windowMs = 15 * 60 * 1000;
        this.maxRequests = 100;
    }
    use(req, res, next) {
        const clientId = req.ip || req.get('X-Forwarded-For') || 'unknown';
        const now = Date.now();
        const windowStart = now - this.windowMs;
        for (const [id, data] of this.requests.entries()) {
            if (data.resetTime < now) {
                this.requests.delete(id);
            }
        }
        let clientData = this.requests.get(clientId);
        if (!clientData || clientData.resetTime < now) {
            clientData = { count: 0, resetTime: now + this.windowMs };
            this.requests.set(clientId, clientData);
        }
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
        clientData.count++;
        res.setHeader('X-RateLimit-Limit', this.maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - clientData.count));
        res.setHeader('X-RateLimit-Reset', new Date(clientData.resetTime).toISOString());
        next();
    }
};
exports.CustomRateLimitMiddleware = CustomRateLimitMiddleware;
exports.CustomRateLimitMiddleware = CustomRateLimitMiddleware = CustomRateLimitMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], CustomRateLimitMiddleware);
let SecurityHeadersMiddleware = class SecurityHeadersMiddleware {
    use(req, res, next) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
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
};
exports.SecurityHeadersMiddleware = SecurityHeadersMiddleware;
exports.SecurityHeadersMiddleware = SecurityHeadersMiddleware = __decorate([
    (0, common_1.Injectable)()
], SecurityHeadersMiddleware);
let CompressionMiddleware = class CompressionMiddleware {
    use(req, res, next) {
        const acceptEncoding = req.get('Accept-Encoding') || '';
        if (acceptEncoding.includes('gzip')) {
            res.setHeader('Content-Encoding', 'gzip');
        }
        else if (acceptEncoding.includes('deflate')) {
            res.setHeader('Content-Encoding', 'deflate');
        }
        next();
    }
};
exports.CompressionMiddleware = CompressionMiddleware;
exports.CompressionMiddleware = CompressionMiddleware = __decorate([
    (0, common_1.Injectable)()
], CompressionMiddleware);
let HealthCheckMiddleware = HealthCheckMiddleware_1 = class HealthCheckMiddleware {
    constructor() {
        this.logger = new common_1.Logger(HealthCheckMiddleware_1.name);
        this.startTime = Date.now();
    }
    use(req, res, next) {
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
};
exports.HealthCheckMiddleware = HealthCheckMiddleware;
exports.HealthCheckMiddleware = HealthCheckMiddleware = HealthCheckMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], HealthCheckMiddleware);
let ApiDocsMiddleware = class ApiDocsMiddleware {
    use(req, res, next) {
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
};
exports.ApiDocsMiddleware = ApiDocsMiddleware;
exports.ApiDocsMiddleware = ApiDocsMiddleware = __decorate([
    (0, common_1.Injectable)()
], ApiDocsMiddleware);
//# sourceMappingURL=performance.middleware.js.map