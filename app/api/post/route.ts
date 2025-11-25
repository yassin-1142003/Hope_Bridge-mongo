import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PostService } from "@/lib/services/PostService";
import { PostCategoryName } from "@/backend/database/mongoose/enums";

const postService = new PostService();

async function getPosts(req: NextRequest) {
  try {
    const categoryParam = req.nextUrl.searchParams.get("category");
    let category: PostCategoryName | undefined;

    if (categoryParam) {
      category = categoryParam as PostCategoryName;
    }

    const posts = await postService.getAllPosts(category);

    return NextResponse.json({
      success: true,
      message: "Posts retrieved successfully",
      data: posts
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "CDN-Cache-Control": "public, s-maxage=300",
        "Vercel-CDN-Cache-Control": "public, s-maxage=300",
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

async function postPost(req: NextRequest) {
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

    const data = await req.json();
    
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

export const GET = getPosts;
export const POST = postPost;
