import { NextRequest, NextResponse } from "next/server";

/**
 * Performance middleware to add optimization headers
 */
export function performanceMiddleware(
  req: NextRequest,
  res: NextResponse,
): NextResponse {
  // Add performance headers
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Preconnect to external domains for faster loading
  if (req.nextUrl.pathname.startsWith("/api")) {
    res.headers.set("Connection", "keep-alive");
  }

  return res;
}

