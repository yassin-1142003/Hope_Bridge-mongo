/**
 * Professional API Response Standards for Hope Bridge
 * 
 * This file defines standardized response formats for all API endpoints
 * to ensure consistency, professionalism, and better user experience.
 */

import { NextResponse } from "next/server";

// Base response structure
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    version: string;
    count?: number;
    type?: string;
    connectionStatus?: string;
    mediaStats?: {
      totalImages: number;
      totalVideos: number;
      projectsWithMedia: number;
    };
    // Media-specific properties
    allowedTypes?: string[];
    uploadedCount?: number;
    fileNames?: string[];
    totalSize?: number;
    // Project-specific properties
    projectsWithMedia?: number;
    // Analytics-specific properties
    period?: string;
    recentEntries?: number;
    projectId?: string;
    generatedAt?: string;
    
    // Generic pagination
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages?: number;
    };
    
    // Task-specific properties
    filters?: {
      status?: string;
      assignedTo?: string;
      priority?: string;
    };
    filesCount?: number;
    fileTypes?: string[];
  };
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  message: string = "Operation completed successfully",
  meta?: Partial<ApiResponse<T>['meta']>
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      ...meta
    }
  };

  return NextResponse.json(response, { status: 200 });
}

// Created response helper (201)
export function createCreatedResponse<T>(
  data: T,
  message: string = "Resource created successfully",
  meta?: Partial<ApiResponse<T>['meta']>
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      ...meta
    }
  };

  return NextResponse.json(response, { status: 201 });
}

// Bad request response helper (400)
export function createBadRequestResponse(
  message: string = "Invalid request",
  code: string = "BAD_REQUEST",
  details?: any
): NextResponse {
  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code,
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    }
  };

  return NextResponse.json(response, { status: 400 });
}

// Unauthorized response helper (401)
export function createUnauthorizedResponse(
  message: string = "Authentication required"
): NextResponse {
  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code: "UNAUTHORIZED",
      message,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    }
  };

  return NextResponse.json(response, { status: 401 });
}

// Forbidden response helper (403)
export function createForbiddenResponse(
  message: string = "Access denied"
): NextResponse {
  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code: "FORBIDDEN",
      message,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    }
  };

  return NextResponse.json(response, { status: 403 });
}

// Not found response helper (404)
export function createNotFoundResponse(
  message: string = "Resource not found"
): NextResponse {
  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code: "NOT_FOUND",
      message,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    }
  };

  return NextResponse.json(response, { status: 404 });
}

// Server error response helper (500)
export function createErrorResponse(
  message: string = "Internal server error",
  code: string = "INTERNAL_ERROR",
  details?: any
): NextResponse {
  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code,
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    }
  };

  return NextResponse.json(response, { status: 500 });
}

// CORS headers helper
export function setCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('X-API-Version', '1.0.0');
  response.headers.set('X-Response-Time', new Date().toISOString());
  return response;
}

// Error handler wrapper
export function handleApiError(error: any, context: string = "API operation"): NextResponse {
  console.error(`❌ ${context} error:`, error);
  
  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (error.name === 'ValidationError') {
    return createBadRequestResponse(
      "Invalid input data",
      "VALIDATION_ERROR",
      isDevelopment ? error.details : undefined
    );
  }
  
  if (error.name === 'UnauthorizedError') {
    return createUnauthorizedResponse(error.message);
  }
  
  if (error.name === 'ForbiddenError') {
    return createForbiddenResponse(error.message);
  }
  
  if (error.name === 'NotFoundError') {
    return createNotFoundResponse(error.message);
  }
  
  // Default server error
  return createErrorResponse(
    "An unexpected error occurred",
    "INTERNAL_ERROR",
    isDevelopment ? { stack: error.stack, context } : undefined
  );
}
