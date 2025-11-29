/**
 * Professional API Response Examples for Hope Bridge
 * 
 * This file demonstrates the standardized response formats for all API endpoints.
 * All responses follow consistent structure with proper error handling and metadata.
 */

// ===== SUCCESS RESPONSE EXAMPLES =====

// 1. GET /api/projects - Success Response
export const projectsSuccessExample = {
  success: true,
  message: "Successfully retrieved 5 projects",
  data: [
    {
      _id: "507f1f77bcf86cd799439011",
      title: "Community Garden Project",
      description: "Transforming unused spaces into thriving community gardens",
      bannerPhotoUrl: "/homepage/01.webp",
      gallery: ["/homepage/02.webp", "/homepage/03.webp"],
      createdAt: "2024-01-15T10:30:00.000Z",
      updatedAt: "2024-01-15T10:30:00.000Z"
    }
  ],
  meta: {
    timestamp: "2024-01-15T10:30:00.000Z",
    version: "1.0.0",
    count: 5,
    connectionStatus: "connected",
    mediaStats: {
      totalImages: 15,
      totalVideos: 3,
      projectsWithMedia: 4
    }
  }
};

// 2. POST /api/projects - Created Response
export const projectCreatedExample = {
  success: true,
  message: "Project created successfully",
  data: {
    _id: "507f1f77bcf86cd799439012",
    title: "New Community Initiative",
    description: "Making a positive impact in our community",
    bannerPhotoUrl: "/homepage/new-project.webp",
    createdAt: "2024-01-15T11:00:00.000Z",
    updatedAt: "2024-01-15T11:00:00.000Z"
  },
  meta: {
    timestamp: "2024-01-15T11:00:00.000Z",
    version: "1.0.0"
  }
};

// 3. GET /api/media - Success Response
export const mediaSuccessExample = {
  success: true,
  message: "Successfully retrieved 12 media files",
  data: [
    {
      _id: "507f1f77bcf86cd799439013",
      filename: "garden-project.jpg",
      originalName: "community-garden.jpg",
      mimetype: "image/jpeg",
      size: 2048576,
      url: "/uploads/garden-project.jpg",
      type: "image",
      createdAt: "2024-01-15T09:15:00.000Z"
    }
  ],
  meta: {
    timestamp: "2024-01-15T10:30:00.000Z",
    version: "1.0.0",
    count: 12,
    type: "all",
    allowedTypes: ["image", "video", "document"]
  }
};

// ===== ERROR RESPONSE EXAMPLES =====

// 1. 400 Bad Request - Validation Error
export const badRequestExample = {
  success: false,
  message: "Invalid input data",
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid input data",
    details: {
      missingFields: ["title", "description"],
      invalidFields: ["email"]
    }
  },
  meta: {
    timestamp: "2024-01-15T10:30:00.000Z",
    version: "1.0.0"
  }
};

// 2. 401 Unauthorized Response
export const unauthorizedExample = {
  success: false,
  message: "Authentication required to create projects",
  error: {
    code: "UNAUTHORIZED",
    message: "Authentication required to create projects"
  },
  meta: {
    timestamp: "2024-01-15T10:30:00.000Z",
    version: "1.0.0"
  }
};

// 3. 403 Forbidden Response
export const forbiddenExample = {
  success: false,
  message: "Admin access required to create projects",
  error: {
    code: "FORBIDDEN",
    message: "Admin access required to create projects"
  },
  meta: {
    timestamp: "2024-01-15T10:30:00.000Z",
    version: "1.0.0"
  }
};

// 4. 404 Not Found Response
export const notFoundExample = {
  success: false,
  message: "Resource not found",
  error: {
    code: "NOT_FOUND",
    message: "Resource not found"
  },
  meta: {
    timestamp: "2024-01-15T10:30:00.000Z",
    version: "1.0.0"
  }
};

// 5. 500 Internal Server Error
export const serverErrorExample = {
  success: false,
  message: "An unexpected error occurred",
  error: {
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
    details: {
      context: "Creating project",
      stack: "Error: Database connection failed..." // Only in development
    }
  },
  meta: {
    timestamp: "2024-01-15T10:30:00.000Z",
    version: "1.0.0"
  }
};

// ===== HTTP STATUS CODES =====

export const httpStatusCodes = {
  // Success
  200: "OK - Request successful",
  201: "Created - Resource created successfully",
  204: "No Content - Request successful, no content returned",
  
  // Client Errors
  400: "Bad Request - Invalid input data",
  401: "Unauthorized - Authentication required",
  403: "Forbidden - Access denied",
  404: "Not Found - Resource not found",
  422: "Unprocessable Entity - Validation failed",
  
  // Server Errors
  500: "Internal Server Error - Unexpected server error",
  502: "Bad Gateway - Invalid response from upstream server",
  503: "Service Unavailable - Server temporarily unavailable"
};

// ===== RESPONSE HEADERS =====

export const responseHeaders = {
  "Content-Type": "application/json",
  "X-API-Version": "1.0.0",
  "X-Response-Time": "2024-01-15T10:30:00.000Z",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-cache, no-store, must-revalidate"
};

// ===== API ENDPOINT CATEGORIES =====

export const apiCategories = {
  // Public APIs
  public: {
    "/api/projects": "Get all projects (public)",
    "/api/projects/[id]": "Get specific project",
    "/api/posts": "Get all posts (public)",
    "/api/rss": "RSS feed"
  },
  
  // Auth APIs
  auth: {
    "/api/auth/login": "User login",
    "/api/auth/register": "User registration", 
    "/api/auth/logout": "User logout",
    "/api/auth/me": "Get current user"
  },
  
  // Admin APIs
  admin: {
    "/api/admin/projects": "Manage projects (admin)",
    "/api/admin/users": "Manage users (admin)",
    "/api/admin/media": "Manage media (admin)",
    "/api/admin/posts": "Manage posts (admin)"
  },
  
  // Service APIs
  services: {
    "/api/contact": "Contact form submission",
    "/api/analytics/visit": "Track page visits",
    "/api/geo": "Geolocation services",
    "/api/verify-turnstile": "Turnstile verification"
  }
};

console.log(`
🎯 PROFESSIONAL API RESPONSE STANDARDS
====================================

✅ CONSISTENT STRUCTURE:
- All responses have success, message, data/meta fields
- Standardized error codes and messages
- Comprehensive metadata with timestamps
- Proper HTTP status codes

✅ PROFESSIONAL FEATURES:
- CORS headers for cross-origin requests
- API version tracking
- Response time tracking
- Detailed error context (development only)
- Pagination metadata for list endpoints

✅ ERROR HANDLING:
- Graceful error responses
- No stack traces in production
- Contextual error messages
- Structured error details

✅ SUCCESS RESPONSES:
- Rich metadata with counts and stats
- Connection status indicators
- Media statistics
- File upload details

All Hope Bridge APIs now follow professional standards! 🚀
`);
