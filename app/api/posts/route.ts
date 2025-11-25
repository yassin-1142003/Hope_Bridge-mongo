import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PostService } from "@/lib/services/PostService";
import { PostCategoryName } from "@/backend/database/mongoose/enums";

const postService = new PostService();

// GET - Get all posts (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as PostCategoryName | undefined;
    
    const posts = await postService.getAllPosts(category);
    
    return NextResponse.json({
      success: true,
      message: "Posts retrieved successfully",
      data: posts
    });
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
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role === "user") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.category || !data.contents || !Array.isArray(data.contents)) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: category, contents" },
        { status: 400 }
      );
    }

    const post = await postService.createPost(data);
    
    return NextResponse.json({
      success: true,
      message: "Post created successfully",
      data: post
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create post" },
      { status: 500 }
    );
  }
}
