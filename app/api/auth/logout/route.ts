import { NextResponse } from 'next/server';
import { beautifulLog } from '@/lib/beautifulResponse';

export async function POST() {
  try {
    beautifulLog.info('🔓 User logout request received');
    
    // For JWT-based auth, we don't need to do anything server-side
    // The client will handle clearing the token from localStorage
    // This endpoint exists for completeness and future server-side session management
    
    beautifulLog.success('✅ Logout successful');
    
    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    }, { status: 200 });

  } catch (error) {
    console.error('Logout error:', error);
    beautifulLog.error('❌ Logout failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
