import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear the auth cookie
    const response = NextResponse.json({
      message: 'Logout successful'
    }, { status: 500 });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Immediately expire
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
