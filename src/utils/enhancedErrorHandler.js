const AppError = require('./appError');
const logger = require('./logger');
const mongoose = require('mongoose');

/**
 * Enhanced Error Handling System
 * Features: Comprehensive error types, detailed logging, security-focused responses
 */

// Error classification
const ErrorTypes = {
  VALIDATION: 'ValidationError',
  AUTHENTICATION: 'AuthenticationError',
  AUTHORIZATION: 'AuthorizationError',
  NOT_FOUND: 'NotFoundError',
  DUPLICATE: 'DuplicateError',
  DATABASE: 'DatabaseError',
  EXTERNAL: 'ExternalServiceError',
  RATE_LIMIT: 'RateLimitError',
  SYSTEM: 'SystemError'
};

// Error severity levels
const Severity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Enhanced AppError Class
 */
class EnhancedAppError extends AppError {
  constructor(message, statusCode, type = ErrorTypes.SYSTEM, severity = Severity.MEDIUM, details = {}) {
    super(message, statusCode);
    
    this.type = type;
    this.severity = severity;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = details.requestId || 'unknown';
    this.userId = details.userId || null;
    this.ip = details.ip || null;
    this.userAgent = details.userAgent || null;
    
    Error.captureStackTrace(this, this.constructor);
  }
  
  toJSON() {
    return {
      success: false,
      error: {
        type: this.type,
        message: this.message,
        severity: this.severity,
        timestamp: this.timestamp,
        requestId: this.requestId,
        ...(process.env.NODE_ENV === 'development' && {
          stack: this.stack,
          details: this.details
        })
      }
    };
  }
}

/**
 * Validation Error Class
 */
class ValidationError extends EnhancedAppError {
  constructor(message, details = {}) {
    super(message, 400, ErrorTypes.VALIDATION, Severity.LOW, details);
  }
}

/**
 * Authentication Error Class
 */
class AuthenticationError extends EnhancedAppError {
  constructor(message = 'Authentication failed', details = {}) {
    super(message, 401, ErrorTypes.AUTHENTICATION, Severity.MEDIUM, details);
  }
}

/**
 * Authorization Error Class
 */
class AuthorizationError extends EnhancedAppError {
  constructor(message = 'Access denied', details = {}) {
    super(message, 403, ErrorTypes.AUTHORIZATION, Severity.MEDIUM, details);
  }
}

/**
 * Not Found Error Class
 */
class NotFoundError extends EnhancedAppError {
  constructor(resource = 'Resource', details = {}) {
    super(`${resource} not found`, 404, ErrorTypes.NOT_FOUND, Severity.LOW, details);
  }
}

/**
 * Duplicate Error Class
 */
class DuplicateError extends EnhancedAppError {
  constructor(resource, details = {}) {
    super(`${resource} already exists`, 409, ErrorTypes.DUPLICATE, Severity.LOW, details);
  }
}

/**
 * Database Error Class
 */
class DatabaseError extends EnhancedAppError {
  constructor(message, details = {}) {
    super(message, 500, ErrorTypes.DATABASE, Severity.HIGH, details);
  }
}

/**
 * Rate Limit Error Class
 */
class RateLimitError extends EnhancedAppError {
  constructor(message = 'Too many requests', details = {}) {
    super(message, 429, ErrorTypes.RATE_LIMIT, Severity.MEDIUM, details);
  }
}

/**
 * External Service Error Class
 */
class ExternalServiceError extends EnhancedAppError {
  constructor(service, message, details = {}) {
    super(`${service} service error: ${message}`, 502, ErrorTypes.EXTERNAL, Severity.HIGH, details);
  }
}

/**
 * Main Error Handler Middleware
 */
const enhancedErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error with context
  const errorContext = {
    requestId: req.id || 'unknown',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || null,
    body: req.body,
    query: req.query,
    params: req.params,
    timestamp: new Date().toISOString()
  };

  // Handle specific error types
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new ValidationError(message, { ...errorContext, field: err.path });
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} '${value}' already exists`;
    error = new DuplicateError(field, { ...errorContext, field, value });
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    
    error = new ValidationError('Validation failed', {
      ...errorContext,
      validationErrors: errors
    });
  } else if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid token', errorContext);
  } else if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token expired', errorContext);
  } else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    error = new DatabaseError('Database operation failed', {
      ...errorContext,
      mongoCode: err.code,
      mongoMessage: err.errmsg
    });
  } else if (err.type === 'entity.parse.failed') {
    error = new ValidationError('Invalid JSON in request body', errorContext);
  } else if (err.type === 'entity.too.large') {
    error = new ValidationError('Request body too large', errorContext);
  } else if (err.type === 'encoding.unsupported') {
    error = new ValidationError('Unsupported content encoding', errorContext);
  } else if (!(error instanceof EnhancedAppError)) {
    // Unknown error
    error = new EnhancedAppError(
      process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
      500,
      ErrorTypes.SYSTEM,
      Severity.HIGH,
      errorContext
    );
  }

  // Add request context to error
  error.requestId = req.id || 'unknown';
  error.ip = req.ip || req.connection.remoteAddress;
  error.userAgent = req.get('User-Agent');
  error.userId = req.user?.id || null;

  // Log the error based on severity
  logError(error, errorContext);

  // Send error response
  sendErrorResponse(error, res);
};

/**
 * Log error based on severity
 */
const logError = (error, context) => {
  const logData = {
    type: error.type,
    message: error.message,
    severity: error.severity,
    requestId: error.requestId,
    userId: error.userId,
    ip: error.ip,
    url: context.url,
    method: context.method,
    timestamp: error.timestamp,
    ...(error.details && { details: error.details })
  };

  switch (error.severity) {
    case Severity.LOW:
      logger.warn('Low severity error', logData);
      break;
    case Severity.MEDIUM:
      logger.error('Medium severity error', logData);
      break;
    case Severity.HIGH:
      logger.error('High severity error', logData);
      // In production, you might want to send high severity errors to monitoring services
      if (process.env.NODE_ENV === 'production') {
        // Send to monitoring service (e.g., Sentry, DataDog)
        sendToMonitoringService(logData);
      }
      break;
    case Severity.CRITICAL:
      logger.error('Critical severity error', logData);
      // Critical errors should trigger immediate alerts
      if (process.env.NODE_ENV === 'production') {
        sendAlert(logData);
      }
      break;
  }
};

/**
 * Send error response based on environment
 */
const sendErrorResponse = (error, res) => {
  // Production: Don't leak sensitive information
  if (process.env.NODE_ENV === 'production') {
    if (error.severity === Severity.LOW || error.severity === Severity.MEDIUM) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          type: error.type,
          message: error.message,
          requestId: error.requestId
        }
      });
    }
  }

  // Development: Send full error details
  res.status(error.statusCode).json(error.toJSON());
};

/**
 * Send to monitoring service (placeholder)
 */
const sendToMonitoringService = async (errorData) => {
  // Integration with monitoring services like Sentry, DataDog, etc.
  try {
    // Example: await Sentry.captureException(errorData);
    console.log('Sending to monitoring service:', errorData);
  } catch (err) {
    logger.error('Failed to send error to monitoring service', err);
  }
};

/**
 * Send alert for critical errors (placeholder)
 */
const sendAlert = async (errorData) => {
  // Integration with alerting systems
  try {
    // Example: await alertManager.sendCriticalAlert(errorData);
    console.log('CRITICAL ALERT:', errorData);
  } catch (err) {
    logger.error('Failed to send critical alert', err);
  }
};

/**
 * Async error wrapper (enhanced)
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    // Add request ID for tracking
    req.id = req.id || generateRequestId();
    
    Promise.resolve(fn(req, res, next)).catch(err => {
      // Add context to the error
      err.requestId = req.id;
      err.ip = req.ip || req.connection.remoteAddress;
      err.userAgent = req.get('User-Agent');
      err.userId = req.user?.id || null;
      
      next(err);
    });
  };
};

/**
 * Generate unique request ID
 */
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection', {
    error: err.message,
    stack: err.stack,
    promise: promise.toString()
  });
  
  // In production, you might want to exit the process
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  
  // Exit the process
  process.exit(1);
});

module.exports = {
  enhancedErrorHandler,
  EnhancedAppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DuplicateError,
  DatabaseError,
  RateLimitError,
  ExternalServiceError,
  ErrorTypes,
  Severity,
  catchAsync,
  generateRequestId
};
