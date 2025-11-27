import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { withErrorHandler } from "@/withErrorHandler";
import { AppError } from "@/lib/errors";

async function getPostsByCategory(
  req: NextRequest,
  { params }: { params: Promise<{ category: string }> },
) {
  const { category } = await params;

  // Validate category
  const validCategories = ['milestone', 'announcement', 'event', 'emergency', 'fundraising', 'project'];
  if (!validCategories.includes(category)) {
    throw new AppError("ERR_MISSING_PARAMETER", "Unknown post category supplied.", {
      category,
    });
  }

  // Get posts from MongoDB
  const postsCollection = await getCollection('posts');
  const posts = await postsCollection
    .find({ category, status: 'published' })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({
    message: "Posts retrieved successfully.",
    success: true,
    details: posts
  });
}

export const GET = withErrorHandler(getPostsByCategory);
