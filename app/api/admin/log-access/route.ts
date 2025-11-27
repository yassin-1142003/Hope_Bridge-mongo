import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email, action, timestamp, ip } = await request.json();
    
    // Log admin access to database for security auditing
    const logsCollection = await getCollection('admin_logs');
    
    await logsCollection.insertOne({
      email,
      action,
      timestamp: new Date(timestamp),
      ip: ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      createdAt: new Date()
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Failed to log admin access:', error);
    return NextResponse.json(
      { error: 'Failed to log access' },
      { status: 500 }
    );
  }
}
