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

// GET - Get single post by ID (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postsCollection = await getCollection('posts');
    
    // Try to find by ObjectId first, then by slug
    let post;
    try {
      post = await postsCollection.findOne({ _id: id });
    } catch {
      // If ObjectId fails, try by slug
      post = await postsCollection.findOne({ slug: id });
    }
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Post retrieved successfully",
      data: post
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PATCH - Update post (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify admin token
    const adminUser = await verifyAdminToken(request);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const updateData = await request.json();
    const postsCollection = await getCollection('posts');
    
    // Try to find by ObjectId first, then by slug
    let existingPost;
    try {
      existingPost = await postsCollection.findOne({ _id: id });
    } catch {
      existingPost = await postsCollection.findOne({ slug: id });
    }
    
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Update post
    const updatedPost = {
      ...updateData,
      updatedAt: new Date()
    };

    const result = await postsCollection.updateOne(
      { _id: existingPost._id },
      { $set: updatedPost }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Return updated post
    const returnedPost = await postsCollection.findOne({ _id: existingPost._id });

    return NextResponse.json({
      success: true,
      message: "Post updated successfully",
      data: returnedPost
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE - Delete post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify admin token
    const adminUser = await verifyAdminToken(request);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const postsCollection = await getCollection('posts');
    
    // Try to find by ObjectId first, then by slug
    let existingPost;
    try {
      existingPost = await postsCollection.findOne({ _id: id });
    } catch {
      existingPost = await postsCollection.findOne({ slug: id });
    }
    
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    const result = await postsCollection.deleteOne({ _id: existingPost._id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
      data: { id: existingPost._id }
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
