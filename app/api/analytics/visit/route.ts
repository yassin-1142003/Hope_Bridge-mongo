import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { DrizzlePGUOW } from "@/backend/database";
import { APIResBuilder } from "@/backend/resManager";
import { VisitorService, withTransaction } from "@/backend/service";
import { authorizeRole } from "@/utils/authorizeRole";
import { withErrorHandler } from "@/withErrorHandler";

async function postVisit(req: NextRequest) {
  // Parse body - handle both JSON and text/plain (for sendBeacon)
  const body = await safeJson(req);

  const headers = req.headers;

  const path = body.path ?? headers.get("referer") ?? "/";
  const locale = body.locale ?? null;
  const projectId = body.projectId ?? null;
  const referrer = body.referrer ?? headers.get("referer") ?? null;
  const userAgent = headers.get("user-agent") ?? null;
  const country =
    body.country ??
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    null;

  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("cf-connecting-ip") ??
    "unknown";
  const ipHash = hashValue(ip);

  // Fire and forget - don't wait for database write
  void withTransaction(async (tx) => {
    const uow = new DrizzlePGUOW(tx);
    const visitorService = new VisitorService(uow);
    return visitorService.trackVisit({
      path,
      locale,
      projectId,
      referrer,
      userAgent,
      ipHash,
      country,
    });
  }).catch((err) => {
    console.error("Visitor tracking error:", err);
  });

  // Return immediately with 202 Accepted
  return NextResponse.json(
    { success: true, message: "Visit recorded successfully." },
    { 
      status: 202,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

async function getVisitSummary(req: NextRequest) {
  await authorizeRole(req);

  const recent = clampNumber(req.nextUrl.searchParams.get("recent"), 1, 500, 100);
  const days = clampNumber(req.nextUrl.searchParams.get("days"), 1, 30, 7);

  const summary = await withTransaction(async (tx) => {
    const uow = new DrizzlePGUOW(tx);
    const visitorService = new VisitorService(uow);
    return visitorService.getSummary({
      recentLimit: recent,
      dailyWindow: days,
    });
  });

  const resBuilder = new APIResBuilder();

  return NextResponse.json(
    resBuilder
      .setMessage("Visit summary retrieved successfully.")
      .setSuccess(true)
      .setDetails(summary)
      .build(),
  );
}

export const POST = withErrorHandler(postVisit);
export const GET = withErrorHandler(getVisitSummary);

async function safeJson(req: NextRequest): Promise<any> {
  try {
    const contentType = req.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return await req.json();
    } else if (contentType?.includes("text/plain")) {
      const text = await req.text();
      return JSON.parse(text);
    }
    return {};
  } catch {
    return {};
  }
}

function hashValue(value: string): string | null {
  if (!value || value === "unknown") return null;
  const secret = process.env.LOGIN_SECRET ?? "hopebridge";
  return createHash("sha256").update(`${value}:${secret}`).digest("hex").slice(0, 32);
}

function clampNumber(
  value: string | null,
  min: number,
  max: number,
  fallback: number,
): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

