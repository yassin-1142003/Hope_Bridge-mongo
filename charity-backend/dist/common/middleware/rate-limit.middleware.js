"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const common_1 = require("@nestjs/common");
let RateLimitMiddleware = class RateLimitMiddleware {
    constructor() {
        this.store = {};
        this.maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '100');
        this.windowMs = parseInt(process.env.RATE_LIMIT_WINDOW || '60000');
    }
    use(req, res, next) {
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
            throw new common_1.HttpException('Too many requests, please try again later', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        record.count++;
        next();
    }
    getKey(req) {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        return `${ip}:${userAgent}`;
    }
};
exports.RateLimitMiddleware = RateLimitMiddleware;
exports.RateLimitMiddleware = RateLimitMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RateLimitMiddleware);
//# sourceMappingURL=rate-limit.middleware.js.map