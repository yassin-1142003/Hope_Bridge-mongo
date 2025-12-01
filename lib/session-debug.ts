// lib/session-debug.ts - Session debugging utilities
import { getServerSession } from './auth';
import { cookies } from 'next/headers';

export async function debugSession() {
  console.log('=== SESSION DEBUG START ===');
  
  try {
    // Check cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    console.log('All cookies:', allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })));
    
    const authToken = cookieStore.get('auth-token')?.value;
    console.log('Auth token found:', !!authToken);
    
    if (authToken) {
      console.log('Auth token length:', authToken.length);
      console.log('Auth token starts with:', authToken.substring(0, 20));
    }
    
    // Check session
    const session = await getServerSession();
    console.log('Session result:', session);
    
    if (session) {
      console.log('Session user:', session.user);
      console.log('Session expires:', session.expires);
    } else {
      console.log('No session found');
    }
    
    // Check environment variables
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);
    
  } catch (error) {
    console.error('Session debug error:', error);
  }
  
  console.log('=== SESSION DEBUG END ===');
  
  return null;
}

export async function createTestSession() {
  console.log('Creating test session...');
  
  try {
    // Create a simple test user session
    const testUser = {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'USER',
      image: null
    };
    
    const session = {
      user: testUser,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    console.log('Test session created:', session);
    return session;
    
  } catch (error) {
    console.error('Failed to create test session:', error);
    return null;
  }
}

export async function forceSession() {
  console.log('Forcing session for dashboard access...');
  
  try {
    // Create a fallback session for testing
    const fallbackSession = {
      user: {
        id: 'fallback-user',
        name: 'Dashboard User',
        email: 'dashboard@hopebridge.com',
        role: 'USER',
        image: null
      },
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    console.log('Fallback session created for dashboard access');
    return fallbackSession;
    
  } catch (error) {
    console.error('Failed to force session:', error);
    return null;
  }
}
