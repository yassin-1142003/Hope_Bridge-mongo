import { NextRequest, NextResponse } from 'next/server';

// Beautiful terminal response middleware
export function createBeautifulResponse(data: any, status: number = 200, message?: string) {
  const timestamp = new Date().toISOString();
  const emoji = status >= 200 && status < 300 ? '✅' : status >= 400 ? '❌' : '⚠️';
  
  console.log(`
🎯 ${emoji} API Response [${status}] - ${timestamp}
📄 Message: ${message || 'Request processed'}
📊 Data: ${JSON.stringify(data, null, 2).substring(0, 200)}${JSON.stringify(data).length > 200 ? '...' : ''}
🔗 Status: ${status}
  `);

  return NextResponse.json({
    success: status >= 200 && status < 300,
    message: message || (status >= 200 && status < 300 ? 'Success' : 'Error'),
    data,
    timestamp,
    status
  }, { status });
}

export function createBeautifulError(message: string, status: number = 500, error?: any) {
  const timestamp = new Date().toISOString();
  
  console.error(`
❌ API Error [${status}] - ${timestamp}
📄 Message: ${message}
🔍 Details: ${error?.message || 'No additional details'}
🔗 Status: ${status}
  `);

  return NextResponse.json({
    success: false,
    message,
    error: error?.message || message,
    timestamp,
    status
  }, { status });
}

// Log beautifier for different types of operations
export const beautifulLog = {
  success: (message: string, data?: any) => {
    console.log(`
✅ SUCCESS - ${new Date().toLocaleTimeString()}
📄 ${message}
${data ? `📊 Data: ${JSON.stringify(data, null, 2)}` : ''}
    `);
  },
  
  error: (message: string, error?: any) => {
    console.error(`
❌ ERROR - ${new Date().toLocaleTimeString()}
📄 ${message}
🔍 Details: ${error?.message || error}
    `);
  },
  
  info: (message: string) => {
    console.log(`
ℹ️  INFO - ${new Date().toLocaleTimeString()}
📄 ${message}
    `);
  },
  
  warning: (message: string) => {
    console.warn(`
⚠️  WARNING - ${new Date().toLocaleTimeString()}
📄 ${message}
    `);
  },
  
  api: (method: string, endpoint: string, status: number, duration?: number) => {
    const emoji = status >= 200 && status < 300 ? '✅' : status >= 400 ? '❌' : '⚠️';
    const timeInfo = duration ? ` (${duration}ms)` : '';
    console.log(`
🌐 API REQUEST - ${new Date().toLocaleTimeString()}
${emoji} ${method} ${endpoint} [${status}]${timeInfo}
    `);
  },
  
  database: (operation: string, collection: string, count?: number) => {
    const countInfo = count ? ` (${count} documents)` : '';
    console.log(`
🗄️  DATABASE - ${new Date().toLocaleTimeString()}
📊 ${operation} on ${collection}${countInfo}
    `);
  },
  
  media: (operation: string, filename: string) => {
    console.log(`
📁 MEDIA - ${new Date().toLocaleTimeString()}
🖼️  ${operation}: ${filename}
    `);
  }
};

// Clean up fetch errors and provide beautiful responses
export function handleFetchError(error: any, endpoint: string) {
  beautifulLog.error(`Fetch failed for ${endpoint}`, error);
  return createBeautifulError(
    `Unable to connect to ${endpoint}`,
    503,
    error
  );
}

// Success response with optional data
export function createSuccessResponse(data?: any, message?: string) {
  return createBeautifulResponse(data, 200, message || 'Operation completed successfully');
}

// Created response (201)
export function createCreatedResponse(data?: any, message?: string) {
  return createBeautifulResponse(data, 201, message || 'Resource created successfully');
}

// Bad request response (400)
export function createBadRequestResponse(message: string = 'Invalid request') {
  return createBeautifulError(message, 400);
}

// Unauthorized response (401)
export function createUnauthorizedResponse(message: string = 'Authentication required') {
  return createBeautifulError(message, 401);
}

// Forbidden response (403)
export function createForbiddenResponse(message: string = 'Access denied') {
  return createBeautifulError(message, 403);
}

// Not found response (404)
export function createNotFoundResponse(message: string = 'Resource not found') {
  return createBeautifulError(message, 404);
}

// Server error response (500)
export function createErrorResponse(error: any, message?: string) {
  return createBeautifulError(message || 'Internal server error', 500, error);
}
