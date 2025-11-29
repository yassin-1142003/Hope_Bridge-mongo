import { NextRequest, NextResponse } from "next/server";
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

// GET - Get all posts (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    
    const postsCollection = await getCollection('posts');
    
    // Build query
    let query: any = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const posts = await postsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({
      success: true,
      message: "Posts retrieved successfully",
      data: posts
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST - Create new post (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const adminUser = await verifyAdminToken(request);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const postData = await request.json();
    
    // Validate required fields
    if (!postData.contents || !Array.isArray(postData.contents) || postData.contents.length === 0) {
      return NextResponse.json(
        { success: false, error: "Contents array is required" },
        { status: 400 }
      );
    }

    const postsCollection = await getCollection('posts');
    
    // Create post
    const post = {
      ...postData,
      status: postData.status || 'draft',
      category: postData.category || 'general',
      images: postData.images || [],
      videos: postData.videos || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await postsCollection.insertOne(post);
    
    return NextResponse.json({
      success: true,
      message: "Post created successfully",
      data: {
        ...post,
        _id: result.insertedId
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create post" },
      { status: 500 }
    );
  }
}
