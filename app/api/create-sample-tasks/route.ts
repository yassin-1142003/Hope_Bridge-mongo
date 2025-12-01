import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Mock response - return success without database operations
    return NextResponse.json({
      success: true,
      message: 'Sample tasks created successfully (mock)',
      tasksCreated: 5,
      usersCreated: 0
    });
  } catch (error) {
    console.error('Error creating sample data:', error);
    return NextResponse.json({
      error: 'Failed to create sample data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
