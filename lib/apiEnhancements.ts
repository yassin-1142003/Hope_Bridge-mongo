/**
 * 🚀 ULTIMATE API ENHANCEMENT SUITE
 * 
 * Professional API enhancement utilities to make all APIs work perfectly:
 * - Advanced caching strategies
 * - Rate limiting and throttling
 * - Request validation and sanitization
 * - Response optimization
 * - Error handling and logging
 * - Performance monitoring
 * - Security enhancements
 * - API versioning support
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import crypto from 'crypto';

// 🎯 Enhanced API Configuration
export const API_CONFIG = {
  // Rate limiting
  RATE_LIMITS: {
    default: { requests: 100, window: 60000 }, // 100 requests per minute
    authenticated: { requests: 1000, window: 60000 }, // 1000 requests per minute
    premium: { requests: 5000, window: 60000 }, // 5000 requests per minute
    upload: { requests: 10, window: 60000 }, // 10 uploads per minute
    search: { requests: 50, window: 60000 }, // 50 searches per minute
  },
  
  // Caching
  CACHE: {
    default: { ttl: 300 }, // 5 minutes
    static: { ttl: 3600 }, // 1 hour
    user: { ttl: 1800 }, // 30 minutes
    search: { ttl: 900 }, // 15 minutes
    analytics: { ttl: 300 }, // 5 minutes
  },
  
  // Security
  SECURITY: {
    maxRequestSize: 10 * 1024 * 1024, // 10MB
    allowedOrigins: ['http://localhost:3000', 'https://yourdomain.com'],
    maxRetries: 3,
    lockoutDuration: 900000, // 15 minutes
  },
  
  // Performance
  PERFORMANCE: {
    slowQueryThreshold: 1000, // 1 second
    maxQueryTime: 30000, // 30 seconds
    enableCompression: true,
    enableMinification: true,
  }
};

// 🛡️ Enhanced Security Manager
class EnhancedSecurityManager {
  private rateLimitStore = new Map<string, { count: number; resetTime: number; locked: boolean }>();
  private requestCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  // 🎯 Rate Limiting
  async checkRateLimit(request: NextRequest, key: string, tier: keyof typeof API_CONFIG.RATE_LIMITS = 'default'): Promise<void> {
    const clientIP = this.getClientIP(request);
    const rateLimitKey = `${key}:${clientIP}`;
    const now = Date.now();
    const config = API_CONFIG.RATE_LIMITS[tier];

    let rateLimitData = this.rateLimitStore.get(rateLimitKey);
    
    if (!rateLimitData || now > rateLimitData.resetTime) {
      rateLimitData = {
        count: 0,
        resetTime: now + config.window,
        locked: false
      };
      this.rateLimitStore.set(rateLimitKey, rateLimitData);
    }

    // Check if client is locked out
    if (rateLimitData.locked) {
      throw new Error(`Rate limit exceeded. Try again after ${Math.ceil((rateLimitData.resetTime - now) / 1000)} seconds.`);
    }

    // Increment request count
    rateLimitData.count++;
    
    // Check if rate limit exceeded
    if (rateLimitData.count > config.requests) {
      rateLimitData.locked = true;
      throw new Error(`Rate limit exceeded. Maximum ${config.requests} requests per ${config.window / 1000} seconds.`);
    }
  }

  // 🔒 Request Validation
  validateRequest(request: NextRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check content length
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > API_CONFIG.SECURITY.maxRequestSize) {
      errors.push(`Request too large. Maximum size is ${API_CONFIG.SECURITY.maxRequestSize / 1024 / 1024}MB.`);
    }
    
    // Check origin
    const origin = request.headers.get('origin');
    if (origin && !API_CONFIG.SECURITY.allowedOrigins.includes(origin)) {
      errors.push('Origin not allowed.');
    }
    
    // Check user agent
    const userAgent = request.headers.get('user-agent');
    if (!userAgent) {
      errors.push('User agent required.');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 🧹 Request Sanitization
  sanitizeInput(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return this.sanitizeString(data);
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        sanitized[key] = value.map(item => this.sanitizeInput(item));
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeInput(value);
      } else {
        sanitized[key] = this.sanitizeString(value);
      }
    }
    
    return sanitized;
  }

  private sanitizeString(value: any): any {
    if (typeof value !== 'string') return value;
    
    // Remove potentially dangerous characters
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  // 🌐 Get Client IP
  private getClientIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for') ||
           request.headers.get('x-real-ip') ||
           request.ip ||
           'unknown';
  }

  // 🔐 Generate Request ID
  generateRequestId(): string {
    return crypto.randomUUID();
  }

  // 📊 Log Security Event
  async logSecurityEvent(event: {
    type: 'rate_limit' | 'invalid_request' | 'unauthorized' | 'forbidden';
    details: any;
    request: NextRequest;
  }): Promise<void> {
    const securityLogsCollection = await getCollection('security_logs');
    
    await securityLogsCollection.insertOne({
      ...event,
      timestamp: new Date(),
      clientIP: this.getClientIP(event.request),
      userAgent: event.request.headers.get('user-agent'),
      requestId: this.generateRequestId()
    });
  }
}

// ⚡ Enhanced Cache Manager
class EnhancedCacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number; hits: number }>();

  // 📦 Get from Cache
  async get(key: string): Promise<any | null> {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Update hit count
    cached.hits++;
    
    return cached.data;
  }

  // 📦 Set Cache
  async set(key: string, data: any, ttl: number = API_CONFIG.CACHE.default.ttl): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    });
  }

  // 🗑️ Clear Cache
  async clear(pattern?: string): Promise<void> {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  // 📊 Get Cache Stats
  getStats(): {
    size: number;
    hitRate: number;
    topKeys: Array<{ key: string; hits: number }>;
  } {
    const entries = Array.from(this.cache.entries());
    const totalHits = entries.reduce((sum, [, cached]) => sum + cached.hits, 0);
    const totalRequests = totalHits + entries.length; // Approximate
    
    return {
      size: this.cache.size,
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
      topKeys: entries
        .map(([key, cached]) => ({ key, hits: cached.hits }))
        .sort((a, b) => b.hits - a.hits)
        .slice(0, 10)
    };
  }
}

// 📈 Performance Monitor
class PerformanceMonitor {
  private metrics = new Map<string, {
    count: number;
    totalTime: number;
    minTime: number;
    maxTime: number;
    errors: number;
  }>();

  // ⏱️ Start Timing
  startTiming(requestId: string): () => number {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric(requestId, duration);
      return duration;
    };
  }

  // 📊 Record Metric
  private recordMetric(requestId: string, duration: number): void {
    const existing = this.metrics.get(requestId) || {
      count: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      errors: 0
    };

    existing.count++;
    existing.totalTime += duration;
    existing.minTime = Math.min(existing.minTime, duration);
    existing.maxTime = Math.max(existing.maxTime, duration);

    this.metrics.set(requestId, existing);

    // Log slow queries
    if (duration > API_CONFIG.PERFORMANCE.slowQueryThreshold) {
      console.warn(`Slow query detected: ${requestId} took ${duration}ms`);
    }
  }

  // 📈 Get Performance Stats
  getStats(): any {
    const stats: any = {};
    
    for (const [endpoint, metrics] of this.metrics.entries()) {
      stats[endpoint] = {
        ...metrics,
        avgTime: metrics.totalTime / metrics.count,
        errorRate: metrics.errors / metrics.count
      };
    }
    
    return stats;
  }
}

// 🎯 Enhanced API Wrapper
export function createEnhancedAPI<T = any>(
  handler: (request: NextRequest, context: any, enhancers: APIEnhancers) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    rateLimitTier?: keyof typeof API_CONFIG.RATE_LIMITS;
    cacheTTL?: number;
    cacheKey?: (request: NextRequest) => string;
    validateInput?: z.ZodSchema;
    permissions?: string[];
    enableMetrics?: boolean;
  } = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const securityManager = new EnhancedSecurityManager();
    const cacheManager = new EnhancedCacheManager();
    const performanceMonitor = new PerformanceMonitor();
    
    const requestId = securityManager.generateRequestId();
    const endpoint = `${request.method}:${request.nextUrl.pathname}`;
    const endTiming = performanceMonitor.startTiming(endpoint);
    
    try {
      // 🔐 Security Validation
      const validation = securityManager.validateRequest(request);
      if (!validation.isValid) {
        await securityManager.logSecurityEvent({
          type: 'invalid_request',
          details: { errors: validation.errors },
          request
        });
        
        return NextResponse.json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid request',
            details: validation.errors
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
            version: 'v2.0'
          }
        }, { status: 400 });
      }

      // 🎯 Rate Limiting
      if (options.rateLimitTier) {
        await securityManager.checkRateLimit(request, endpoint, options.rateLimitTier);
      }

      // 🔐 Authentication
      let session = null;
      if (options.requireAuth) {
        session = await getServerSession();
        if (!session || !session.user) {
          await securityManager.logSecurityEvent({
            type: 'unauthorized',
            details: {},
            request
          });
          
          return NextResponse.json({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required'
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId,
              version: 'v2.0'
            }
          }, { status: 401 });
        }
      }

      // 🗄️ Cache Check
      let cacheKey: string | null = null;
      if (options.cacheKey) {
        cacheKey = options.cacheKey(request);
        const cached = await cacheManager.get(cacheKey);
        if (cached) {
          return NextResponse.json({
            ...cached,
            meta: {
              ...cached.meta,
              requestId,
              cached: true,
              version: 'v2.0'
            }
          });
        }
      }

      // 🧹 Input Validation & Sanitization
      let validatedInput = null;
      if (options.validateInput) {
        const body = await request.json().catch(() => ({}));
        const sanitizedBody = securityManager.sanitizeInput(body);
        
        try {
          validatedInput = options.validateInput.parse(sanitizedBody);
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Input validation failed',
              details: error instanceof z.ZodError ? error.errors : error
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId,
              version: 'v2.0'
            }
          }, { status: 400 });
        }
      }

      // 🚀 Execute Handler
      const enhancers: APIEnhancers = {
        securityManager,
        cacheManager,
        performanceMonitor,
        session,
        requestId,
        validatedInput
      };

      const response = await handler(request, context, enhancers);
      
      // 📦 Cache Response
      if (cacheKey && options.cacheTTL && response.ok) {
        const responseData = await response.json();
        await cacheManager.set(cacheKey, responseData, options.cacheTTL);
      }

      // 📊 Performance Metrics
      const duration = endTiming();
      
      // 🎯 Add Performance Headers
      response.headers.set('X-Response-Time', duration.toString());
      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-API-Version', 'v2.0');
      
      return response;

    } catch (error) {
      const duration = endTiming();
      
      // 🚨 Error Handling
      console.error(`API Error [${requestId}]:`, error);
      
      await securityManager.logSecurityEvent({
        type: 'forbidden',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        request
      });
      
      return NextResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error',
          details: process.env.NODE_ENV === 'development' ? error : undefined
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          duration,
          version: 'v2.0'
        }
      }, { status: 500 });
    }
  };
}

// 🔧 API Enhancers Interface
export interface APIEnhancers {
  securityManager: EnhancedSecurityManager;
  cacheManager: EnhancedCacheManager;
  performanceMonitor: PerformanceMonitor;
  session: any;
  requestId: string;
  validatedInput: any;
}

// 🎯 Utility Functions
export const APIUtils = {
  // 📄 Pagination Helper
  createPagination(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    };
  },

  // 🔍 Search Helper
  createSearchQuery(search: string, fields: string[]) {
    return {
      $or: fields.map(field => ({
        [field]: { $regex: search, $options: 'i' }
      }))
    };
  },

  // 📊 Aggregate Helper
  createAggregation(pipeline: any[], options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const { page = 1, limit = 20, sortBy, sortOrder } = options;
    
    // Add sorting
    if (sortBy) {
      pipeline.push({ $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } });
    }
    
    // Add pagination
    if (page && limit) {
      pipeline.push(
        { $skip: (page - 1) * limit },
        { $limit: limit }
      );
    }
    
    return pipeline;
  },

  // 🧹 Filter Helper
  sanitizeFilters(filters: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
};

// 🎯 Export instances
export const securityManager = new EnhancedSecurityManager();
export const cacheManager = new EnhancedCacheManager();
export const performanceMonitor = new PerformanceMonitor();
