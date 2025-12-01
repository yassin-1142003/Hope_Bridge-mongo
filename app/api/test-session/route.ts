import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { debugSession, createTestSession } from '@/lib/session-debug';

export async function GET(request: NextRequest) {
  console.log('=== SESSION TEST API CALLED ===');
  
  try {
    // Debug current session
    await debugSession();
    
    // Get actual session
    const session = await getServerSession();
    
    // Create test session for comparison
    const testSession = await createTestSession();
    
    const response = {
      timestamp: new Date().toISOString(),
      hasSession: !!session,
      session: session,
      testSession: testSession,
      environment: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET?.length,
        nodeEnv: process.env.NODE_ENV
      },
      cookies: {
        authCookie: request.cookies.get('auth-token')?.value ? 'present' : 'missing'
      }
    };
    
    console.log('Session test response:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Session test API error:', error);
    
    return NextResponse.json({
      error: 'Session test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('=== SESSION CREATE API CALLED ===');
  
  try {
    const body = await request.json();
    const { email, name, role = 'USER' } = body;
    
    if (!email || !name) {
      return NextResponse.json({
        error: 'Email and name are required'
      }, { status: 400 });
    }
    
    // Create a simple session for testing
    const testSession = {
      user: {
        id: 'test-user-' + Date.now(),
        name: name,
        email: email,
        role: role,
        image: null
      },
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    console.log('Created test session:', testSession);
    
    return NextResponse.json({
      success: true,
      session: testSession,
      message: 'Test session created successfully'
    });
    
  } catch (error) {
    console.error('Session create API error:', error);
    
    return NextResponse.json({
      error: 'Session creation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
