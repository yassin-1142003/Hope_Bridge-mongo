// lib/errorHandling/ErrorHandler.ts - Comprehensive error handling system
import { notificationManager } from '../notifications/NotificationManager';

export interface ErrorInfo {
  message: string;
  code?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'validation' | 'authentication' | 'permission' | 'system' | 'user';
  context?: Record<string, any>;
  timestamp: string;
  userId?: string;
  stack?: string;
  userAgent?: string;
  url?: string;
}

export interface ErrorReport {
  id: string;
  errors: ErrorInfo[];
  summary: {
    total: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
  };
  generatedAt: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: ErrorInfo[] = [];
  private errorCallbacks: Set<(error: ErrorInfo) => void> = new Set();
  private maxErrors = 1000; // Keep last 1000 errors
  private retryAttempts = new Map<string, number>();
  private readonly MAX_RETRY_ATTEMPTS = 3;

  private constructor() {
    this.setupGlobalErrorHandlers();
    this.setupPerformanceMonitoring();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Error registration
  handleError(error: Error | string, context?: Record<string, any>): string {
    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message,
      code: this.extractErrorCode(error),
      severity: this.determineSeverity(error, context),
      category: this.categorizeError(error, context),
      context,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
      stack: typeof error === 'object' ? error.stack : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };

    this.addError(errorInfo);
    return errorInfo.timestamp;
  }

  private addError(error: ErrorInfo): void {
    // Add to errors array
    this.errors.unshift(error);
    
    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Notify subscribers
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });

    // Show user notification for high/critical severity
    if (error.severity === 'high' || error.severity === 'critical') {
      this.showErrorNotification(error);
    }

    // Log to console
    this.logError(error);

    // Report to monitoring service
    this.reportError(error);
  }

  // Error categorization
  private categorizeError(error: Error | string, context?: Record<string, any>): ErrorInfo['category'] {
    const message = typeof error === 'string' ? error : error.message;
    const lowerMessage = message.toLowerCase();

    // Network errors
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || 
        lowerMessage.includes('connection') || context?.request) {
      return 'network';
    }

    // Authentication errors
    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('forbidden') ||
        lowerMessage.includes('token') || lowerMessage.includes('auth')) {
      return 'authentication';
    }

    // Permission errors
    if (lowerMessage.includes('permission') || lowerMessage.includes('access denied') ||
        lowerMessage.includes('not allowed')) {
      return 'permission';
    }

    // Validation errors
    if (lowerMessage.includes('validation') || lowerMessage.includes('required') ||
        lowerMessage.includes('invalid') || context?.validation) {
      return 'validation';
    }

    // System errors
    if (lowerMessage.includes('system') || lowerMessage.includes('internal') ||
        lowerMessage.includes('server') || lowerMessage.includes('timeout')) {
      return 'system';
    }

    // Default to user error
    return 'user';
  }

  private determineSeverity(error: Error | string, context?: Record<string, any>): ErrorInfo['severity'] {
    const message = typeof error === 'string' ? error : error.message;
    const lowerMessage = message.toLowerCase();

    // Critical errors
    if (lowerMessage.includes('critical') || lowerMessage.includes('fatal') ||
        lowerMessage.includes('crash') || context?.critical) {
      return 'critical';
    }

    // High severity
    if (lowerMessage.includes('error') || lowerMessage.includes('failed') ||
        lowerMessage.includes('exception') || context?.highSeverity) {
      return 'high';
    }

    // Medium severity
    if (lowerMessage.includes('warning') || lowerMessage.includes('deprecated') ||
        context?.mediumSeverity) {
      return 'medium';
    }

    // Default to low
    return 'low';
  }

  private extractErrorCode(error: Error | string): string | undefined {
    if (typeof error === 'object' && 'code' in error) {
      return String(error.code);
    }
    
    if (typeof error === 'string') {
      const match = error.match(/\b(ERR|ERROR|CODE)\s*[:\-]?\s*(\w+)/i);
      return match ? match[2] : undefined;
    }

    return undefined;
  }

  // User feedback
  private async showErrorNotification(error: ErrorInfo): Promise<void> {
    try {
      const userMessage = this.getUserFriendlyMessage(error);
      
      await notificationManager.addNotification({
        title: this.getNotificationTitle(error),
        message: userMessage,
        type: error.severity === 'critical' ? 'error' : 'warning',
        userId: this.getCurrentUserId() || 'anonymous',
        priority: error.severity === 'critical' ? 'urgent' : 'high',
        actionUrl: this.getHelpUrl(error),
        actionText: 'Get Help',
        metadata: { errorId: error.timestamp, category: error.category }
      });
    } catch (notificationError) {
      console.error('Failed to show error notification:', notificationError);
    }
  }

  private getUserFriendlyMessage(error: ErrorInfo): string {
    const messages: Record<ErrorInfo['category'], string> = {
      network: 'Connection issue detected. Please check your internet connection and try again.',
      authentication: 'Authentication required. Please sign in to continue.',
      permission: 'You don\'t have permission to perform this action.',
      validation: 'Please check your input and try again.',
      system: 'A system error occurred. Please try again later.',
      user: 'An unexpected error occurred. Please try again.'
    };

    return messages[error.category] || 'An unexpected error occurred. Please try again.';
  }

  private getNotificationTitle(error: ErrorInfo): string {
    const titles: Record<ErrorInfo['severity'], string> = {
      critical: 'Critical Error',
      high: 'Error',
      medium: 'Warning',
      low: 'Notice'
    };

    return titles[error.severity] || 'Notice';
  }

  private getHelpUrl(error: ErrorInfo): string | undefined {
    const helpUrls: Record<ErrorInfo['category'], string> = {
      network: '/help/network-issues',
      authentication: '/help/authentication',
      permission: '/help/permissions',
      validation: '/help/validation',
      system: '/help/system-errors',
      user: '/help/general-errors'
    };

    return helpUrls[error.category];
  }

  // Retry mechanism
  async retryOperation<T>(
    operation: () => Promise<T>,
    operationId: string,
    options: {
      maxAttempts?: number;
      delay?: number;
      backoffMultiplier?: number;
      onRetry?: (attempt: number, error: Error) => void;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = this.MAX_RETRY_ATTEMPTS,
      delay = 1000,
      backoffMultiplier = 2,
      onRetry
    } = options;

    let currentDelay = delay;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        // Reset retry attempts on success
        this.retryAttempts.delete(operationId);
        return result;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxAttempts) {
          // Final attempt failed, handle the error
          this.handleError(lastError, { 
            operationId, 
            finalAttempt: true, 
            totalAttempts: maxAttempts 
          });
          throw lastError;
        }

        // Call retry callback
        onRetry?.(attempt, lastError);

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= backoffMultiplier;
      }
    }

    throw lastError!;
  }

  // Error reporting and analytics
  private async reportError(error: ErrorInfo): Promise<void> {
    try {
      // Report to monitoring service
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(error)
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  async generateErrorReport(): Promise<ErrorReport> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentErrors = this.errors.filter(error => 
      new Date(error.timestamp) > oneDayAgo
    );

    const summary = {
      total: recentErrors.length,
      bySeverity: recentErrors.reduce((acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCategory: recentErrors.reduce((acc, error) => {
        acc[error.category] = (acc[error.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return {
      id: Date.now().toString(),
      errors: recentErrors,
      summary,
      generatedAt: now.toISOString()
    };
  }

  // Subscription management
  subscribe(callback: (error: ErrorInfo) => void): () => void {
    this.errorCallbacks.add(callback);
    
    return () => {
      this.errorCallbacks.delete(callback);
    };
  }

  // Error retrieval
  getErrors(options?: {
    severity?: ErrorInfo['severity'];
    category?: ErrorInfo['category'];
    limit?: number;
    since?: Date;
  }): ErrorInfo[] {
    let filtered = [...this.errors];

    if (options?.severity) {
      filtered = filtered.filter(error => error.severity === options.severity);
    }

    if (options?.category) {
      filtered = filtered.filter(error => error.category === options.category);
    }

    if (options?.since) {
      filtered = filtered.filter(error => new Date(error.timestamp) > options.since!);
    }

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    recent: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const recentErrors = this.errors.filter(error => 
      new Date(error.timestamp) > oneHourAgo
    );

    return {
      total: this.errors.length,
      bySeverity: this.errors.reduce((acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCategory: this.errors.reduce((acc, error) => {
        acc[error.category] = (acc[error.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recent: recentErrors.length
    };
  }

  // Clear errors
  clearErrors(options?: {
    severity?: ErrorInfo['severity'];
    category?: ErrorInfo['category'];
    olderThan?: Date;
  }): void {
    if (!options) {
      this.errors = [];
      return;
    }

    this.errors = this.errors.filter(error => {
      if (options.severity && error.severity === options.severity) return false;
      if (options.category && error.category === options.category) return false;
      if (options.olderThan && new Date(error.timestamp) < options.olderThan) return false;
      return true;
    });
  }

  // Utility methods
  private getCurrentUserId(): string | undefined {
    try {
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id || payload.email;
      }
    } catch (error) {
      // Token parsing failed
    }
    return undefined;
  }

  private getAuthToken(): string {
    return localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token') || '';
  }

  private logError(error: ErrorInfo): void {
    const logMethod = error.severity === 'critical' ? 'error' : 
                     error.severity === 'high' ? 'error' :
                     error.severity === 'medium' ? 'warn' : 'info';

    console[logMethod](`[${error.severity.toUpperCase()}] ${error.category}: ${error.message}`, {
      code: error.code,
      context: error.context,
      timestamp: error.timestamp,
      userId: error.userId
    });
  }

  private setupGlobalErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(event.reason || 'Unhandled promise rejection', {
          type: 'unhandledrejection',
          promise: event.promise
        });
      });

      // Handle JavaScript errors
      window.addEventListener('error', (event) => {
        this.handleError(event.message || 'JavaScript error', {
          type: 'javascript',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });
    }
  }

  private setupPerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor long tasks
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 100) { // Tasks longer than 100ms
              this.handleError(`Performance issue: Long task detected (${entry.duration.toFixed(2)}ms)`, {
                type: 'performance',
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
              });
            }
          }
        });

        try {
          observer.observe({ entryTypes: ['longtask'] });
        } catch (error) {
          // PerformanceObserver not supported for longtask
        }
      }
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility functions for common error scenarios
export const handleNetworkError = (error: any, context?: Record<string, any>) => {
  return errorHandler.handleError(error, { ...context, networkError: true });
};

export const handleValidationError = (error: any, field?: string) => {
  return errorHandler.handleError(error, { validation: true, field });
};

export const handleAuthError = (error: any, operation?: string) => {
  return errorHandler.handleError(error, { authentication: true, operation });
};

export const handlePermissionError = (error: any, resource?: string) => {
  return errorHandler.handleError(error, { permission: true, resource });
};

// React hook for error handling
export function useErrorHandler() {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [stats, setStats] = useState(errorHandler.getErrorStats());

  useEffect(() => {
    const unsubscribe = errorHandler.subscribe((error) => {
      setErrors(prev => [error, ...prev.slice(0, 99)]); // Keep last 100 errors
      setStats(errorHandler.getErrorStats());
    });

    return unsubscribe;
  }, []);

  const handleError = useCallback((error: Error | string, context?: Record<string, any>) => {
    return errorHandler.handleError(error, context);
  }, []);

  const clearErrors = useCallback((options?: {
    severity?: ErrorInfo['severity'];
    category?: ErrorInfo['category'];
    olderThan?: Date;
  }) => {
    errorHandler.clearErrors(options);
    setStats(errorHandler.getErrorStats());
  }, []);

  return {
    errors,
    stats,
    handleError,
    clearErrors,
    retryOperation: errorHandler.retryOperation.bind(errorHandler)
  };
}
