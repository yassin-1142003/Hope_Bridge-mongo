//api/project/[id]/route.ts
import { DrizzlePGUOW } from "@/backend/database";
import { AppError } from "@/backend/errorHandler";
import { APIResBuilder } from "@/backend/resManager";
import { ProjectService, withTransaction } from "@/backend/service";
import { authOptions } from "@/lib/auth";
import { withErrorHandler } from "@/withErrorHandler";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

async function getOneProjectById(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const project = await withTransaction(async (tx) => {
    const uow = new DrizzlePGUOW(tx);
    const projectService = new ProjectService(uow);
    return projectService.getOneById(id);
  });

  const resBuilder = new APIResBuilder();

  return NextResponse.json(
    resBuilder
      .setMessage("Project retrieved successfully.")
      .setSuccess(true)
      .setDetails(project)
      .build(),
    {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        "CDN-Cache-Control": "public, s-maxage=600",
        "Vercel-CDN-Cache-Control": "public, s-maxage=600",
      },
    },
  );
}

async function patchProject(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await ensureManagerAccess();

  const payload = await req.json();

  const updatedProject = await withTransaction(async (tx) => {
    const uow = new DrizzlePGUOW(tx);
    const projectService = new ProjectService(uow);
    return projectService.updateOne(id, payload);
  });

  const resBuilder = new APIResBuilder();

  return NextResponse.json(
    resBuilder
      .setMessage("Project updated successfully.")
      .setSuccess(true)
      .setDetails(updatedProject)
      .build(),
  );
}

async function deleteProject(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await ensureManagerAccess();

  await withTransaction(async (tx) => {
    const uow = new DrizzlePGUOW(tx);
    const projectService = new ProjectService(uow);
    await projectService.deleteOneById(id);
  });

  const resBuilder = new APIResBuilder();

  return NextResponse.json(
    resBuilder
      .setMessage("Project deleted successfully.")
      .setSuccess(true)
      .setDetails({ id })
      .build(),
  );
}

export const GET = withErrorHandler(getOneProjectById);
export const PATCH = withErrorHandler(patchProject);
export const DELETE = withErrorHandler(deleteProject);

async function ensureManagerAccess() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new AppError("ERR_UNAUTHORIZED", "You must be logged in to access this resource.", {}, 401);
  }

  if (session.user.role === "user") {
    throw new AppError(
      "ERR_UNAUTHORIZED",
      "You do not have permission to access this resource.",
      { role: session.user.role },
      403,
    );
  }
}
