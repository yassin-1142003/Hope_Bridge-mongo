// app/api/errors/report/route.ts - Error reporting API endpoint
import { NextRequest, NextResponse } from 'next/server';

// Server-side error handler (not using client-side localStorage)
class ServerErrorHandler {
  private errors: Array<any> = [];
  
  handleError(errorInfo: any): string {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const error = {
      ...errorInfo,
      id: errorId,
      timestamp: new Date().toISOString()
    };
    
    this.errors.push(error);
    
    // Keep only last 1000 errors
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-1000);
    }
    
    // Log to console for now
    console.error('Error reported:', error);
    
    return errorId;
  }
  
  getErrors(filters: any = {}): any[] {
    let filteredErrors = [...this.errors];
    
    if (filters.severity) {
      filteredErrors = filteredErrors.filter(e => e.severity === filters.severity);
    }
    
    if (filters.category) {
      filteredErrors = filteredErrors.filter(e => e.category === filters.category);
    }
    
    if (filters.userId) {
      filteredErrors = filteredErrors.filter(e => e.userId === filters.userId);
    }
    
    if (filters.olderThan) {
      const cutoff = new Date(filters.olderThan);
      filteredErrors = filteredErrors.filter(e => new Date(e.timestamp) < cutoff);
    }
    
    return filteredErrors.slice(0, filters.limit || 100);
  }
  
  getErrorStats(): any {
    const total = this.errors.length;
    const bySeverity = this.errors.reduce((acc, e) => {
      acc[e.severity] = (acc[e.severity] || 0) + 1;
      return acc;
    }, {});
    
    const byCategory = this.errors.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {});
    
    const recent24h = this.errors.filter(e => 
      new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;
    
    return {
      total,
      bySeverity,
      byCategory,
      recent24h,
      averagePerDay: total / Math.max(1, Math.ceil((Date.now() - new Date(this.errors[0]?.timestamp || Date.now()).getTime()) / (24 * 60 * 60 * 1000)))
    };
  }
  
  clearErrors(filters: any = {}): void {
    if (Object.keys(filters).length === 0) {
      this.errors = [];
    } else {
      this.errors = this.errors.filter(e => {
        if (filters.severity && e.severity === filters.severity) return false;
        if (filters.category && e.category === filters.category) return false;
        if (filters.olderThan && new Date(e.timestamp) < new Date(filters.olderThan)) return false;
        return true;
      });
    }
  }
}

const serverErrorHandler = new ServerErrorHandler();

// Simple auth verification (without external dependencies)
async function verifyAuth(request: NextRequest): Promise<{ isAuthenticated: boolean; userId?: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAuthenticated: false };
    }
    
    const token = authHeader.substring(7);
    
    // Simple JWT validation (in production, use proper JWT library)
    const parts = token.split('.');
    if (parts.length !== 3) return { isAuthenticated: false };
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    const now = Date.now() / 1000;
    
    if (payload.exp && payload.exp < now) {
      return { isAuthenticated: false };
    }
    
    return { 
      isAuthenticated: true, 
      userId: payload.id || payload.email || 'unknown' 
    };
  } catch (error) {
    return { isAuthenticated: false };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication (optional - allow anonymous error reporting)
    let userId = 'anonymous';
    try {
      const authResult = await verifyAuth(request);
      if (authResult.isAuthenticated) {
        userId = authResult.userId || 'unknown';
      }
    } catch {
      // Continue with anonymous reporting if auth fails
    }

    const body = await request.json();
    const { message, code, severity, category, context, stack, userAgent, url } = body;

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        { error: 'Missing required field: message' },
        { status: 400 }
      );
    }

    // Create error report
    const errorInfo = {
      message,
      code,
      severity: severity || 'medium',
      category: category || 'user',
      context: context || {},
      timestamp: new Date().toISOString(),
      userId,
      stack,
      userAgent: userAgent || request.headers.get('user-agent'),
      url: url || request.headers.get('referer')
    };

    // Add error to handler
    const errorId = serverErrorHandler.handleError(errorInfo);

    // Optionally send to external monitoring service
    await sendToMonitoringService(errorInfo);

    return NextResponse.json({
      success: true,
      errorId,
      message: 'Error reported successfully'
    });
  } catch (error) {
    console.error('Error reporting API error:', error);
    return NextResponse.json(
      { error: 'Failed to report error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication for error retrieval
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');
    const userId = searchParams.get('userId');

    // Get filtered errors
    const filters: any = {};
    if (severity) filters.severity = severity;
    if (category) filters.category = category;
    if (userId) filters.userId = userId;
    filters.limit = limit;

    const errors = serverErrorHandler.getErrors(filters);
    const stats = serverErrorHandler.getErrorStats();

    return NextResponse.json({
      success: true,
      errors,
      stats,
      count: errors.length
    });
  } catch (error) {
    console.error('Error reporting API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication for error deletion
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const category = searchParams.get('category');
    const olderThan = searchParams.get('olderThan');

    // Clear errors with filters
    const filters: any = {};
    if (severity) filters.severity = severity;
    if (category) filters.category = category;
    if (olderThan) filters.olderThan = new Date(olderThan);

    serverErrorHandler.clearErrors(filters);

    return NextResponse.json({
      success: true,
      message: 'Errors cleared successfully'
    });
  } catch (error) {
    console.error('Error reporting API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to send to external monitoring service
async function sendToMonitoringService(errorInfo: any) {
  try {
    // This would integrate with services like:
    // - Sentry
    // - Bugsnag
    // - Rollbar
    // - Custom monitoring endpoint
    
    // For now, just log to console
    console.log('Error reported to monitoring service:', errorInfo);
    
    // Example integration (commented out):
    // if (process.env.SENTRY_DSN) {
    //   const Sentry = require('@sentry/node');
    //   Sentry.captureException(new Error(errorInfo.message), {
    //     tags: { category: errorInfo.category },
    //     extra: errorInfo.context
    //   });
    // }
  } catch (error) {
    console.error('Failed to send to monitoring service:', error);
  }
}
