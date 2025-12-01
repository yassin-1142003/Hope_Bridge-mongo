import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getCollection } from '@/lib/mongodb';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export async function GET(request: NextRequest) {
  try {
    console.log('Auth me endpoint called');
    
    // Get token from cookie first (preferred method)
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    // Fallback to Authorization header if no cookie
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    const finalToken = token || headerToken;
    
    console.log('Token found:', !!finalToken);
    
    if (!finalToken) {
      console.log('No token found in cookie or header');
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(finalToken, JWT_SECRET) as any;
      console.log('Token verified for user:', decoded.email || decoded.userId);
    } catch (error) {
      console.log('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user from database - try multiple lookup methods
    const usersCollection = await getCollection('users');
    let user = null;
    
    // Try by userId first
    if (decoded.userId) {
      user = await usersCollection.findOne(
        { _id: decoded.userId },
        {
          projection: {
            passwordHash: 0 // Exclude password hash
          }
        }
      );
    }
    
    // If not found, try by email
    if (!user && decoded.email) {
      user = await usersCollection.findOne(
        { email: decoded.email },
        {
          projection: {
            passwordHash: 0 // Exclude password hash
          }
        }
      );
    }

    if (!user) {
      console.log('User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('User account is deactivated');
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    console.log('User found and active:', user.email);
    
    // Return success with 200 status (was incorrectly returning 500)
    return NextResponse.json({
      success: true,
      message: 'User retrieved successfully',
      user: {
        _id: user._id.toString(),
        id: user._id.toString(), // Add id field for compatibility
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified || false
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
