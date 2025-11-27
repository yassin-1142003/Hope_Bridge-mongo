import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getCollection } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Helper function to verify admin token
async function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'ADMIN') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const adminUser = await verifyAdminToken(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const usersCollection = await getCollection('users');
    
    // Fetch all users (excluding sensitive data)
    const users = await usersCollection
      .find(
        {},
        {
          projection: {
            passwordHash: 0, // Exclude password hash
            __v: 0 // Exclude version field
          }
        }
      )
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({
      message: 'Users retrieved successfully',
      details: users
    });

  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
