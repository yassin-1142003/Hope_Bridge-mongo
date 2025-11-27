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

    // Get counts for dashboard
    const [usersCollection, projectsCollection, postsCollection] = await Promise.all([
      getCollection('users'),
      getCollection('projects'),
      getCollection('posts')
    ]);
    
    const [userCount, projectCount, postCount] = await Promise.all([
      usersCollection.countDocuments({}),
      projectsCollection.countDocuments({}),
      postsCollection.countDocuments({})
    ]);
    
    return NextResponse.json({
      message: 'Admin overview retrieved successfully',
      details: {
        userCount,
        projectCount,
        postCount
      }
    });

  } catch (error) {
    console.error('Admin overview API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
