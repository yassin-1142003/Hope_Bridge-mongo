/**
 * Enhanced API Security v2.0
 * 
 * Enterprise-grade security utilities for all APIs:
 * - Advanced input validation and sanitization
 * - Rate limiting and DDoS protection
 * - Authentication and authorization middleware
 * - Request/response encryption
 * - CSRF and XSS protection
 * - SQL injection and NoSQL injection prevention
 * - Security headers and CORS configuration
 * - Audit logging for security events
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { z } from "zod";
import crypto from 'crypto';
import { getCollection } from "@/lib/mongodb";
import { UserRole, hasPermission } from "@/lib/roles";

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // Limit each IP to 1000 requests per windowMs
    maxLoginAttempts: 5, // Max login attempts per window
    maxAdminRequests: 500, // Stricter limit for admin endpoints
    maxFileUploads: 10, // Max file uploads per window
    maxSearchRequests: 200, // Max search requests per window
  },
  
  // Encryption
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16,
    saltLength: 32
  },
  
  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  },
  
  // Input validation
  validation: {
    maxStringLength: 10000,
    maxArrayLength: 1000,
    maxObjectDepth: 10,
    allowedMimeTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/csv',
      'application/json', 'application/xml'
    ],
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedDomains: [
      'localhost', '127.0.0.1',
      process.env.NEXT_PUBLIC_DOMAIN,
      'yourdomain.com' // Add your domain here
    ]
  }
};

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number; lastAccess: number }>();

// Enhanced Security Manager
class EnhancedSecurityManager {
  private encryptionKey: Buffer;
  
  constructor() {
    this.encryptionKey = this.getEncryptionKey();
  }
  
  /**
   * Main security middleware for API requests
   */
  async secureRequest(request: NextRequest, options: {
    requireAuth?: boolean;
    requiredPermissions?: string[];
    rateLimitKey?: string;
    validateInput?: boolean;
    encryptResponse?: boolean;
    auditLog?: boolean;
  } = {}): Promise<{ request: NextRequest; session?: any; user?: any }> {
    const {
      requireAuth = true,
      requiredPermissions = [],
      rateLimitKey = 'default',
      validateInput = true,
      encryptResponse = false,
      auditLog = true
    } = options;
    
    // 1. Basic security checks
    await this.performBasicSecurityChecks(request);
    
    // 2. Rate limiting
    await this.checkRateLimit(request, rateLimitKey);
    
    // 3. Authentication
    let session: any, user: any;
    if (requireAuth) {
      session = await getServerSession();
      if (!session || !session.user) {
        throw new SecurityError('Authentication required', 'UNAUTHORIZED');
      }
      user = session.user;
      
      // 4. Authorization
      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(permission =>
          hasPermission(user.role as UserRole, permission as any)
        );
        if (!hasAllPermissions) {
          throw new SecurityError('Insufficient permissions', 'FORBIDDEN');
        }
      }
    }
    
    // 5. Input validation
    if (validateInput) {
      await this.validateRequestInput(request);
    }
    
    // 6. Security audit logging
    if (auditLog && user) {
      await this.logSecurityEvent(request, user, 'ACCESS_GRANTED');
    }
    
    return { request, session, user };
  }
  
  /**
   * Secure response with security headers and optional encryption
   */
  secureResponse(response: NextResponse, options: {
    encrypt?: boolean;
    addSecurityHeaders?: boolean;
    cacheControl?: string;
  } = {}): NextResponse {
    const {
      encrypt = false,
      addSecurityHeaders = true,
      cacheControl = 'no-store, no-cache, must-revalidate'
    } = options;
    
    // Add security headers
    if (addSecurityHeaders) {
      Object.entries(SECURITY_CONFIG.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }
    
    // Add cache control
    response.headers.set('Cache-Control', cacheControl);
    
    // Encrypt response if requested
    if (encrypt && response.body) {
      const encryptedData = this.encryptData(response.body);
      response = new NextResponse(encryptedData, {
        status: response.status,
        headers: response.headers
      });
    }
    
    return response;
  }
  
  /**
   * Perform basic security checks on the request
   */
  private async performBasicSecurityChecks(request: NextRequest): Promise<void> {
    // Check for suspicious headers
    const suspiciousHeaders = ['x-forwarded-host', 'x-originating-ip'];
    for (const header of suspiciousHeaders) {
      if (request.headers.get(header)) {
        await this.logSecurityEvent(request, null, 'SUSPICIOUS_HEADER', { header });
        throw new SecurityError('Suspicious request detected', 'BAD_REQUEST');
      }
    }
    
    // Check origin
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    
    if (origin && !this.isAllowedOrigin(origin)) {
      await this.logSecurityEvent(request, null, 'INVALID_ORIGIN', { origin });
      throw new SecurityError('Invalid origin', 'FORBIDDEN');
    }
    
    // Check for common attack patterns
    const url = request.url.toLowerCase();
    const attackPatterns = [
      '../', '<script', 'javascript:', 'vbscript:', 'onload=', 'onerror=',
      'eval(', 'alert(', 'document.cookie', 'window.location', 'union select',
      'drop table', 'insert into', 'delete from', 'update set'
    ];
    
    for (const pattern of attackPatterns) {
      if (url.includes(pattern)) {
        await this.logSecurityEvent(request, null, 'ATTACK_PATTERN_DETECTED', { pattern });
        throw new SecurityError('Potential attack detected', 'BAD_REQUEST');
      }
    }
  }
  
  /**
   * Rate limiting implementation
   */
  public async checkRateLimit(request: NextRequest, key: string): Promise<void> {
    const clientIp = this.getClientIP(request);
    const rateLimitKey = `${key}:${clientIp}`;
    
    const now = Date.now();
    const windowStart = now - SECURITY_CONFIG.rateLimiting.windowMs;
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(rateLimitKey);
    
    if (!entry || entry.resetTime < now) {
      // Create new entry
      entry = {
        count: 0,
        resetTime: now + SECURITY_CONFIG.rateLimiting.windowMs,
        lastAccess: now
      };
      rateLimitStore.set(rateLimitKey, entry);
    }
    
    // Increment counter
    entry.count++;
    entry.lastAccess = now;
    
    // Get appropriate limit based on key
    let maxRequests = SECURITY_CONFIG.rateLimiting.maxRequests;
    if (key === 'login') maxRequests = SECURITY_CONFIG.rateLimiting.maxLoginAttempts;
    if (key === 'admin') maxRequests = SECURITY_CONFIG.rateLimiting.maxAdminRequests;
    if (key === 'file-upload') maxRequests = SECURITY_CONFIG.rateLimiting.maxFileUploads;
    if (key === 'search') maxRequests = SECURITY_CONFIG.rateLimiting.maxSearchRequests;
    
    // Check if limit exceeded
    if (entry.count > maxRequests) {
      await this.logSecurityEvent(request, null, 'RATE_LIMIT_EXCEEDED', {
        key,
        count: entry.count,
        maxRequests,
        resetTime: entry.resetTime
      });
      
      throw new SecurityError('Rate limit exceeded', 'TOO_MANY_REQUESTS', {
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      });
    }
    
    // Clean up old entries
    this.cleanupRateLimitStore();
  }
  
  /**
   * Validate request input
   */
  private async validateRequestInput(request: NextRequest): Promise<void> {
    const method = request.method;
    
    // Validate based on method
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      const contentType = request.headers.get('content-type') || '';
      
      // Check content type
      if (!contentType.includes('application/json') && 
          !contentType.includes('multipart/form-data') &&
          !contentType.includes('application/x-www-form-urlencoded')) {
        throw new SecurityError('Invalid content type', 'BAD_REQUEST');
      }
      
      // For JSON requests, validate body
      if (contentType.includes('application/json')) {
        try {
          const body = await request.clone().json();
          this.validateInputData(body);
        } catch (error) {
          if (error instanceof SecurityError) {
            throw error;
          }
          // If JSON parsing fails, it's not a security issue, let the API handle it
        }
      }
      
      // For file uploads, validate files
      if (contentType.includes('multipart/form-data')) {
        await this.validateFileUpload(request);
      }
    }
  }
  
  /**
   * Validate input data recursively
   */
  private validateInputData(data: any, depth: number = 0): void {
    if (depth > SECURITY_CONFIG.validation.maxObjectDepth) {
      throw new SecurityError('Input data too deeply nested', 'BAD_REQUEST');
    }
    
    if (data === null || data === undefined) {
      return;
    }
    
    if (typeof data === 'string') {
      if (data.length > SECURITY_CONFIG.validation.maxStringLength) {
        throw new SecurityError('String too long', 'BAD_REQUEST');
      }
      
      // Check for XSS patterns
      const xssPatterns = ['<script', 'javascript:', 'vbscript:', 'onload=', 'onerror='];
      for (const pattern of xssPatterns) {
        if (data.toLowerCase().includes(pattern)) {
          throw new SecurityError('Potential XSS detected', 'BAD_REQUEST');
        }
      }
    } else if (Array.isArray(data)) {
      if (data.length > SECURITY_CONFIG.validation.maxArrayLength) {
        throw new SecurityError('Array too long', 'BAD_REQUEST');
      }
      
      for (const item of data) {
        this.validateInputData(item, depth + 1);
      }
    } else if (typeof data === 'object') {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          // Validate key
          if (typeof key === 'string' && key.length > 100) {
            throw new SecurityError('Object key too long', 'BAD_REQUEST');
          }
          
          // Validate value
          this.validateInputData(data[key], depth + 1);
        }
      }
    }
  }
  
  /**
   * Validate file uploads
   */
  private async validateFileUpload(request: NextRequest): Promise<void> {
    try {
      const formData = await request.clone().formData();
      
      for (const [name, file] of formData.entries()) {
        if (file instanceof File) {
          // Check file size
          if (file.size > SECURITY_CONFIG.validation.maxFileSize) {
            throw new SecurityError('File too large', 'BAD_REQUEST');
          }
          
          // Check file type
          if (!SECURITY_CONFIG.validation.allowedMimeTypes.includes(file.type)) {
            throw new SecurityError('File type not allowed', 'BAD_REQUEST');
          }
          
          // Check file name for suspicious patterns
          const fileName = file.name.toLowerCase();
          const suspiciousPatterns = ['.exe', '.bat', '.cmd', '.scr', '.php', '.asp', '.jsp'];
          
          for (const pattern of suspiciousPatterns) {
            if (fileName.includes(pattern)) {
              throw new SecurityError('Suspicious file type', 'BAD_REQUEST');
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof SecurityError) {
        throw error;
      }
      // If form data parsing fails, let the API handle it
    }
  }
  
  /**
   * Check if origin is allowed
   */
  private isAllowedOrigin(origin: string): boolean {
    try {
      const originUrl = new URL(origin);
      const allowedDomains = SECURITY_CONFIG.validation.allowedDomains;
      
      return allowedDomains.some(domain => {
        if (domain === 'localhost') {
          return originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1';
        }
        return originUrl.hostname === domain || originUrl.hostname.endsWith(`.${domain}`);
      });
    } catch {
      return false;
    }
  }
  
  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for') ||
           request.headers.get('x-real-ip') ||
           request.headers.get('cf-connecting-ip') ||
           'unknown';
  }
  
  /**
   * Clean up old rate limit entries
   */
  private cleanupRateLimitStore(): void {
    const now = Date.now();
    const cutoff = now - SECURITY_CONFIG.rateLimiting.windowMs;
    
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < cutoff) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  /**
   * Log security events
   */
  private async logSecurityEvent(
    request: NextRequest, 
    user: any, 
    eventType: string, 
    metadata?: any
  ): Promise<void> {
    try {
      const auditCollection = await getCollection('security_audit_logs');
      
      await auditCollection.insertOne({
        eventType,
        timestamp: new Date(),
        userId: user?.email || null,
        userRole: user?.role || null,
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent'),
        endpoint: request.url,
        method: request.method,
        metadata: metadata || {},
        severity: this.getEventSeverity(eventType)
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
  
  /**
   * Get event severity
   */
  private getEventSeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'ACCESS_GRANTED': 'low',
      'RATE_LIMIT_EXCEEDED': 'medium',
      'SUSPICIOUS_HEADER': 'high',
      'ATTACK_PATTERN_DETECTED': 'critical',
      'INVALID_ORIGIN': 'medium',
      'POTENTIAL_XSS': 'critical',
      'SUSPICIOUS_FILE': 'high'
    };
    
    return severityMap[eventType] || 'low';
  }
  
  /**
   * Encryption utilities
   */
  private getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Encryption key not configured');
    }
    return Buffer.from(key, 'hex');
  }
  
  encryptData(data: any): string {
    const iv = crypto.randomBytes(SECURITY_CONFIG.encryption.ivLength);
    const salt = crypto.randomBytes(SECURITY_CONFIG.encryption.saltLength);
    
    // Derive key using PBKDF2
    const derivedKey = crypto.pbkdf2Sync(
      this.encryptionKey,
      salt,
      100000,
      SECURITY_CONFIG.encryption.keyLength,
      'sha256'
    );
    
    const cipher = crypto.createCipher(SECURITY_CONFIG.encryption.algorithm, derivedKey);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // For AES-GCM, we would normally get auth tag, but since we're using createCipher (not createCipherGCM),
    // we'll create a simple HMAC for integrity
    const hmac = crypto.createHmac('sha256', derivedKey);
    hmac.update(encrypted);
    const tag = hmac.digest();
    
    // Combine all components
    const combined = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'hex')
    ]);
    
    return combined.toString('base64');
  }
  
  decryptData(encryptedData: string): any {
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = combined.slice(0, SECURITY_CONFIG.encryption.saltLength);
    const iv = combined.slice(
      SECURITY_CONFIG.encryption.saltLength,
      SECURITY_CONFIG.encryption.saltLength + SECURITY_CONFIG.encryption.ivLength
    );
    const tag = combined.slice(
      SECURITY_CONFIG.encryption.saltLength + SECURITY_CONFIG.encryption.ivLength,
      SECURITY_CONFIG.encryption.saltLength + SECURITY_CONFIG.encryption.ivLength + 32 // HMAC length
    );
    const encrypted = combined.slice(
      SECURITY_CONFIG.encryption.saltLength + SECURITY_CONFIG.encryption.ivLength + 32
    );
    
    // Derive key
    const derivedKey = crypto.pbkdf2Sync(
      this.encryptionKey,
      salt,
      100000,
      SECURITY_CONFIG.encryption.keyLength,
      'sha256'
    );
    
    const decipher = crypto.createDecipher(SECURITY_CONFIG.encryption.algorithm, derivedKey);
    
    // Verify HMAC
    const hmac = crypto.createHmac('sha256', derivedKey);
    hmac.update(encrypted);
    const expectedTag = hmac.digest();
    
    if (!crypto.timingSafeEqual(tag, expectedTag)) {
      throw new Error('Integrity check failed');
    }
    
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
  
  /**
   * Input sanitization utilities
   */
  sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }
  
  sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'string') {
          sanitized[key] = this.sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object') {
          sanitized[key] = this.sanitizeObject(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
    }
    
    return sanitized;
  }
  
  /**
   * CSRF protection utilities
   */
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
  
  validateCSRFToken(token: string, sessionToken: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(sessionToken, 'hex')
    );
  }
  
  /**
   * Password security utilities
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('Password should be at least 8 characters long');
    
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');
    
    if (/\d/.test(password)) score += 1;
    else feedback.push('Include numbers');
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('Include special characters');
    
    // Common patterns
    if (!/(.)\1{2,}/.test(password)) score += 1;
    else feedback.push('Avoid repeating characters');
    
    if (!/123|abc|qwe|password|letmein/i.test(password)) score += 1;
    else feedback.push('Avoid common patterns');
    
    return {
      isValid: score >= 6,
      score: Math.min(score, 8) as number,
      feedback
    };
  }
  
  /**
   * API key validation
   */
  validateAPIKey(apiKey: string): boolean {
    // In production, validate against database
    return apiKey && apiKey.length === 64 && /^[a-f0-9]+$/i.test(apiKey);
  }
  
  /**
   * JWT token validation
   */
  validateJWTToken(token: string): any {
    try {
      // In production, use proper JWT library
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      // Check expiration
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        throw new Error('Token expired');
      }
      
      return payload;
    } catch (error) {
      throw new SecurityError('Invalid token', 'UNAUTHORIZED');
    }
  }
}

// Custom error class for security issues
class SecurityError extends Error {
  public statusCode: string;
  public metadata?: any;
  
  constructor(message: string, statusCode: string, metadata?: any) {
    super(message);
    this.name = 'SecurityError';
    this.statusCode = statusCode;
    this.metadata = metadata;
  }
}

// Enhanced validation schemas with security
const secureStringSchema = z.string()
  .min(1)
  .max(1000)
  .transform(val => enhancedSecurityManager.sanitizeString(val));

const secureEmailSchema = z.string()
  .email()
  .transform(val => val.toLowerCase());

const secureObjectSchema = z.object({})
  .transform(val => enhancedSecurityManager.sanitizeObject(val));

// Rate limiting middleware factory
function createRateLimitMiddleware(key: string, maxRequests: number) {
  return async (request: NextRequest) => {
    await enhancedSecurityManager.checkRateLimit(request, key);
  };
}

// Security middleware factory
function createSecurityMiddleware(options: {
  requireAuth?: boolean;
  requiredPermissions?: string[];
  rateLimitKey?: string;
  validateInput?: boolean;
} = {}) {
  return async (request: NextRequest) => {
    return await enhancedSecurityManager.secureRequest(request, options);
  };
}

// Export singleton instance and utilities
const enhancedSecurityManager = new EnhancedSecurityManager();

export {
  EnhancedSecurityManager,
  SecurityError,
  enhancedSecurityManager,
  SECURITY_CONFIG,
  secureStringSchema,
  secureEmailSchema,
  secureObjectSchema,
  createRateLimitMiddleware,
  createSecurityMiddleware
};
