import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { withErrorHandler } from "@/withErrorHandler";
import { verifyAdminToken } from "@/lib/auth";

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
  (async () => {
    try {
      const visitsCollection = await getCollection('visits');
      await visitsCollection.insertOne({
        path,
        locale,
        projectId,
        referrer,
        userAgent,
        ipHash,
        country,
        createdAt: new Date()
      });
    } catch (err) {
      console.error("Visitor tracking error:", err);
    }
  })();

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
  // Verify admin token
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json(
      { error: "Authorization token required" },
      { status: 401 }
    );
  }

  const adminUser = await verifyAdminToken(token);
  if (!adminUser) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  const recent = clampNumber(req.nextUrl.searchParams.get("recent"), 1, 500, 100);
  const days = clampNumber(req.nextUrl.searchParams.get("days"), 1, 30, 7);

  // Get visit summary from MongoDB
  const visitsCollection = await getCollection('visits');
  const now = new Date();
  const daysAgo = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

  const [totalVisits, recentVisits, dailyStats] = await Promise.all([
    visitsCollection.countDocuments(),
    visitsCollection.find().sort({ createdAt: -1 }).limit(recent).toArray(),
    visitsCollection.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray()
  ]);

  return NextResponse.json({
    message: "Visit summary retrieved successfully.",
    success: true,
    details: {
      totalVisits,
      recentVisits: recentVisits.length,
      dailyStats
    }
  });
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

