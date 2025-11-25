import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/withErrorHandler";
import { DrizzlePGUOW } from "@/backend/database";
import { APIResBuilder } from "@/backend/resManager";
import { ProjectService, withTransaction } from "@/backend/service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Project } from "@/backend/database/mongoose/models";
import { sendProjectUpdateEmail } from "@/lib/mailer";

// 🔒 POST (protected: only manager can create project)
async function postProject(req: NextRequest) {
      const session = await getServerSession(authOptions);
 if (!session || !session.user) {
    return NextResponse.json(
      { error: "You must be logged in to access this resource" },
      { status: 401 }
    );
  }

  if (session.user.role === "user") {
    return NextResponse.json(
      { error: "You do not have permission to view this post" },
      { status: 403 }
    );
  }

  const data = await req.json();

  const savedProject = await withTransaction(async (tx): Promise<Project> => {
    const uow = new DrizzlePGUOW(tx);
    const projectService = new ProjectService( uow);

    return projectService.saveOne(data);
  });

  const notificationApiUrl = process.env.NOTIFICATION_API_URL;

  if (notificationApiUrl) {
    try {
      await fetch(`${notificationApiUrl}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: (savedProject as any)?.title ?? data.title,
          description: (savedProject as any)?.description ?? data.description,
          link: (savedProject as any)?.link ?? data.link,
          image: (savedProject as any)?.image ?? data.image,
        }),
      });
    } catch (err) {
      console.error("Failed to notify subscribers about new project", err);
    }
  }

  void notifyUsersAboutProject(savedProject, data);

  const resBuilder = new APIResBuilder();

  return NextResponse.json(
    resBuilder
      .setMessage("Project created successfully.")
      .setSuccess(true)
      .setDetails(savedProject)
      .build(),
    { status: 201 },
  );
}

async function getAllProjects() {
  const allProjects = await withTransaction(async (tx) => {
    const uow = new DrizzlePGUOW(tx);
    const projectService = new ProjectService(uow);

    const allProjects = await projectService.getAll();

    return allProjects;
  });

  const resBuilder = new APIResBuilder();

  return NextResponse.json(
    resBuilder
      .setMessage("Projects retrieved successfully.")
      .setSuccess(true)
      .setDetails(allProjects)
      .build(),
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "CDN-Cache-Control": "public, s-maxage=300",
        "Vercel-CDN-Cache-Control": "public, s-maxage=300",
      },
    },
  );
}

export const POST = withErrorHandler(postProject);
export const GET = withErrorHandler(getAllProjects);

function normalizeHighlights(rawHighlights: unknown): string[] {
  if (Array.isArray(rawHighlights)) {
    return rawHighlights
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof rawHighlights === "string") {
    return rawHighlights
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

async function fetchAllUserEmails(): Promise<string[]> {
  try {
    return await withTransaction(async (tx) => {
      const uow = new DrizzlePGUOW(tx);
      const users = await uow.usrRepo.getAll();
      return users.map((user) => user.email).filter(Boolean);
    });
  } catch (err) {
    console.error("Failed to fetch user emails for project notification", err);
    return [];
  }
}

async function notifyUsersAboutProject(project: Project, requestPayload: any) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials are not configured; skipping update email.");
      return;
    }

    const recipients = await fetchAllUserEmails();
    if (!recipients.length) {
      console.warn("No user emails found; skipping project update email.");
      return;
    }

    await sendProjectUpdateEmail({
      project,
      recipients,
      title: requestPayload?.emailTitle ?? requestPayload?.title,
      summary: requestPayload?.emailSummary ?? requestPayload?.description,
      body: requestPayload?.emailBody,
      highlights: normalizeHighlights(
        requestPayload?.emailHighlights ?? requestPayload?.highlights,
      ),
      ctaLabel: requestPayload?.emailCtaLabel,
      ctaUrl: requestPayload?.emailCtaUrl ?? requestPayload?.link,
      bannerUrl: requestPayload?.emailBannerUrl ?? requestPayload?.bannerPhotoUrl,
      previewText: requestPayload?.emailPreviewText ?? requestPayload?.summary,
    });
  } catch (err) {
    console.error("Failed to dispatch project update email", err);
  }
}
