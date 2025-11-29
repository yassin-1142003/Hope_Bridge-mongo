import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { AppError } from "@/lib/errors";

export async function authorizeRole(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user) {
    throw new AppError(
      "ERR_UNAUTHORIZED",
      "You must be logged in to access this resource",
    )
  }

  if (session.user.role === "USER") {
    throw new AppError(
      "ERR_UNAUTHORIZED",
      "You do not have permission to view this post",
    )
  }
}
