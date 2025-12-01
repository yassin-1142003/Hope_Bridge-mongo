// lib/middleware/ActivityTracker.ts - Middleware to automatically track all API activities
import { NextRequest, NextResponse } from 'next/server';
import { taskTracker } from '@/lib/mongodb/TaskTracker';
import { verifyToken } from '@/lib/auth';

export interface ActivityTrackerOptions {
  excludePaths?: string[];
  excludeMethods?: string[];
  logRequestBody?: boolean;
  logResponseBody?: boolean;
  enableMetrics?: boolean;
}

export class ActivityTracker {
  private static instance: ActivityTracker;
  private options: ActivityTrackerOptions;

  constructor(options: ActivityTrackerOptions = {}) {
    this.options = {
      excludePaths: ['/health', '/_next', '/api/health'],
      excludeMethods: ['OPTIONS', 'HEAD'],
      logRequestBody: true,
      logResponseBody: false, // Don't log response bodies by default for security
      enableMetrics: true,
      ...options
    };
  }

  static getInstance(options?: ActivityTrackerOptions): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker(options);
    }
    return ActivityTracker.instance;
  }

  /**
   * Middleware function to wrap API handlers with activity tracking
   */
  wrapHandler(handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) {
    return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
      const startTime = Date.now();
      const url = req.url;
      const method = req.method;
      
      // Skip tracking for excluded paths and methods
      if (this.shouldExclude(url, method)) {
        return handler(req, ...args);
      }

      let requestBody: any;
      let responseBody: any;
      let statusCode = 200;
      let success = true;
      let errorMessage: string | undefined;

      try {
        // Capture request body if enabled
        if (this.options.logRequestBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
          try {
            requestBody = await req.clone().json();
          } catch (e) {
            // If body parsing fails, skip it
          }
        }

        // Execute the original handler
        const response = await handler(req, ...args);
        statusCode = response.status;
        success = statusCode < 400;

        // Capture response body if enabled and response is successful
        if (this.options.logResponseBody && success) {
          try {
            responseBody = await response.clone().json();
          } catch (e) {
            // If response parsing fails, skip it
          }
        }

        // Log the activity
        await this.logApiActivity(req, {
          startTime,
          statusCode,
          success,
          errorMessage,
          requestBody,
          responseBody
        });

        return response;
      } catch (error) {
        statusCode = 500;
        success = false;
        errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Log the error
        await this.logApiActivity(req, {
          startTime,
          statusCode,
          success,
          errorMessage,
          requestBody,
          responseBody
        });

        throw error;
      }
    };
  }

  /**
   * Track specific user actions manually
   */
  async trackUserAction(context: {
    request: NextRequest;
    action: string;
    entityType: 'task' | 'project' | 'user' | 'notification' | 'system' | 'email' | 'file' | 'api';
    entityId: string;
    entityName: string;
    operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'SEND' | 'RECEIVE' | 'LOGIN' | 'LOGOUT' | 'ASSIGN' | 'COMPLETE';
    description: string;
    dataSent?: any;
    dataReceived?: any;
    success?: boolean;
    errorMessage?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const user = await this.getUserFromRequest(context.request);
      
      await taskTracker.logActivity({
        userId: user?.id || 'anonymous',
        userRole: user?.role || 'USER',
        userName: user?.name || 'Anonymous User',
        userEmail: user?.email || 'anonymous@hopebridge.com',
        action: context.action,
        entityType: context.entityType,
        entityId: context.entityId,
        entityName: context.entityName,
        operation: context.operation,
        description: context.description,
        dataSent: context.dataSent,
        dataReceived: context.dataReceived,
        success: context.success ?? true,
        errorMessage: context.errorMessage,
        ipAddress: this.getClientIP(context.request),
        userAgent: context.request.headers.get('user-agent') || undefined,
        department: user?.department,
        metadata: context.metadata,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Failed to track user action:', error);
    }
  }

  /**
   * Create a higher-order function for Next.js API routes
   */
  withActivityTracking(
    handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
    options?: {
      customAction?: string;
      entityType?: string;
      extractEntityId?: (req: NextRequest) => string;
      extractEntityName?: (req: NextRequest) => string;
    }
  ) {
    return this.wrapHandler(async (req: NextRequest, context?: any) => {
      const response = await handler(req, context);
      
      // Additional custom tracking if options provided
      if (options && this.options.enableMetrics) {
        const user = await this.getUserFromRequest(req);
        const url = new URL(req.url);
        
        await this.trackUserAction({
          request: req,
          action: options.customAction || `${req.method}_${url.pathname}`,
          entityType: options.entityType || this.extractEntityTypeFromPath(url.pathname),
          entityId: options.extractEntityId?.(req) || this.extractEntityIdFromPath(url.pathname),
          entityName: options.extractEntityName?.(req) || this.extractEntityNameFromPath(url.pathname),
          operation: this.extractOperationFromMethod(req.method),
          description: `${user?.role || 'User'} performed ${req.method} on ${url.pathname}`,
          success: response.status < 400,
          metadata: {
            statusCode: response.status,
            responseTime: Date.now() - Date.now()
          }
        });
      }
      
      return response;
    });
  }

  // Private helper methods
  private shouldExclude(url: string, method: string): boolean {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    return (
      this.options.excludePaths?.some(excluded => path.includes(excluded)) ||
      this.options.excludeMethods?.includes(method)
    );
  }

  private async logApiActivity(req: NextRequest, context: {
    startTime: number;
    statusCode: number;
    success: boolean;
    errorMessage?: string;
    requestBody?: any;
    responseBody?: any;
  }): Promise<void> {
    if (!this.options.enableMetrics) return;

    try {
      const user = await this.getUserFromRequest(req);
      const url = new URL(req.url);
      
      await taskTracker.logApiRequest({
        userId: user?.id || 'anonymous',
        userRole: user?.role || 'USER',
        userName: user?.name || 'Anonymous User',
        userEmail: user?.email || 'anonymous@hopebridge.com',
        endpoint: url.pathname,
        method: req.method,
        statusCode: context.statusCode,
        responseTime: Date.now() - context.startTime,
        requestBody: context.requestBody,
        responseBody: context.responseBody,
        success: context.success ?? true,
        errorMessage: context.errorMessage,
        ipAddress: this.getClientIP(req),
        userAgent: req.headers.get('user-agent') || undefined,
        department: user?.department
      });
    } catch (error) {
      console.error('Failed to log API activity:', error);
    }
  }

  private async getUserFromRequest(req: NextRequest): Promise<any> {
    try {
      // Try Bearer token first
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        return await verifyToken(token);
      }

      // Try cookies
      const cookieStore = await import('next/headers').then(m => m.cookies());
      const token = cookieStore.get('auth-token')?.value;
      if (token) {
        return await verifyToken(token);
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private getClientIP(req: NextRequest): string {
    return (
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      'unknown'
    );
  }

  private extractEntityTypeFromPath(path: string): 'task' | 'project' | 'user' | 'notification' | 'system' | 'api' {
    if (path.includes('/tasks')) return 'task';
    if (path.includes('/projects')) return 'project';
    if (path.includes('/users')) return 'user';
    if (path.includes('/notifications')) return 'notification';
    if (path.includes('/admin')) return 'system';
    return 'api';
  }

  private extractEntityIdFromPath(path: string): string {
    const parts = path.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.match(/^[0-9a-fA-F]{24}$/) ? lastPart : 'unknown';
  }

  private extractEntityNameFromPath(path: string): string {
    const parts = path.split('/');
    return parts[parts.length - 2] || 'unknown';
  }

  private extractOperationFromMethod(method: string): 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'SEND' | 'RECEIVE' | 'LOGIN' | 'LOGOUT' | 'ASSIGN' | 'COMPLETE' {
    switch (method) {
      case 'GET': return 'READ';
      case 'POST': return 'CREATE';
      case 'PUT':
      case 'PATCH': return 'UPDATE';
      case 'DELETE': return 'DELETE';
      default: return 'READ';
    }
  }
}

// Singleton instance
export const activityTracker = ActivityTracker.getInstance();

// Decorator for API routes
export function withActivityTracking(options?: {
  customAction?: string;
  entityType?: string;
  extractEntityId?: (req: NextRequest) => string;
  extractEntityName?: (req: NextRequest) => string;
}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = activityTracker.withActivityTracking(method, options);
    return descriptor;
  };
}
