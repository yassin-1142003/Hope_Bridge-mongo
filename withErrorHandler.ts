import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';

function withErrorHandler<T extends (...args: any[]) => Promise<any>>(handler: T) {
  return async (...args: Parameters<T>): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (err: any) {
      return handleError(err);
    }
  };
}

function handleError(err: any) {
  // Handle AppError instances
  if (err instanceof AppError) {
    console.error(`AppError [${err.code}]: ${err.message}`, err.details);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details
        }
      },
      { status: err.statusCode }
    );
  }

  // Handle unknown errors
  console.error("Unknown error occurred:", err);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "ERR_INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    },
    { status: 500 }
  );
}

export { withErrorHandler, handleError };
