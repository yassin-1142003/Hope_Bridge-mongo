import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Test basic database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Test if we can query users table
    const userCount = await prisma.user.count();
    
    // Test if we can query tasks table
    const taskCount = await prisma.task.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        userCount,
        taskCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
