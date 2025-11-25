import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AppError } from "@/backend/errorHandler";

export async function authorizeRole(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new AppError(
      "ERR_UNAUTHORIZED",
      "You must be logged in to access this resource",
    )
  }

  if (session.user.role === "user") {
    throw new AppError(
      "ERR_UNAUTHORIZED",
      "You do not have permission to view this post",
    )
  }
}
