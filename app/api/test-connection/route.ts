import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock connection test - return success without database operations
    return NextResponse.json({
      success: true,
      message: 'Mock connection successful',
      data: {
        userCount: 0,
        taskCount: 0,
        timestamp: new Date().toISOString(),
        note: 'Using mock data - no database connection required'
      }
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
