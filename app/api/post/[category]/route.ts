import { DrizzlePGUOW, PostCategoryNameArr } from "@/backend/database";
import type { PostCategoryName } from "@/backend/database";
import { APIResBuilder } from "@/backend/resManager";
import { PostService, withTransaction } from "@/backend/service";
import { AppError } from "@/backend/errorHandler";
import { withErrorHandler } from "@/withErrorHandler";
import { NextRequest, NextResponse } from "next/server";

async function getPostsByCategory(
  req: NextRequest,
  { params }: { params: Promise<{ category: string }> },
) {
  const { category } = await params;

  if (!PostCategoryNameArr.includes(category as PostCategoryName)) {
    throw new AppError("ERR_MISSING_PARAMETER", "Unknown post category supplied.", {
      category,
    });
  }

  const posts = await withTransaction(async (tx) => {
    const uow = new DrizzlePGUOW(tx);
    const postService = new PostService(uow);
    return postService.getAll(category as PostCategoryName);
  });

  const resBuilder = new APIResBuilder();

  return NextResponse.json(
    resBuilder
      .setMessage("Posts retrieved successfully.")
      .setSuccess(true)
      .setDetails(posts)
      .build(),
  );
}

export const GET = withErrorHandler(getPostsByCategory);
