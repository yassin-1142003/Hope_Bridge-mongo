import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { withErrorHandler } from "@/withErrorHandler";
import { verifyAdminToken } from "@/lib/auth";
import { 
  createSuccessResponse, 
  createBadRequestResponse, 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  createErrorResponse, 
  handleApiError, 
  setCorsHeaders 
} from "@/lib/apiResponse";

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

  // Validate required fields for project tracking
  if (projectId && typeof projectId !== 'string') {
    return setCorsHeaders(createBadRequestResponse(
      "Invalid projectId format",
      "INVALID_PROJECT_ID"
    ));
  }

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
        visitType: projectId ? 'project' : 'page',
        createdAt: new Date()
      });
    } catch (err) {
      console.error("Visitor tracking error:", err);
    }
  })();

  // Return immediately with 202 Accepted
  const response = NextResponse.json(
    { success: true, message: "Visit recorded successfully." },
    { 
      status: 202,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
  
  return setCorsHeaders(response);
}

async function getVisitSummary(req: NextRequest) {
  // Verify admin token
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return setCorsHeaders(createUnauthorizedResponse("Authorization token required"));
  }

  const adminUser = await verifyAdminToken(token);
  if (!adminUser) {
    return setCorsHeaders(createForbiddenResponse("Admin access required"));
  }

  const recent = clampNumber(req.nextUrl.searchParams.get("recent"), 1, 500, 100);
  const days = clampNumber(req.nextUrl.searchParams.get("days"), 1, 30, 7);
  const projectId = req.nextUrl.searchParams.get("projectId");

  // Get visit summary from MongoDB
  const visitsCollection = await getCollection('visits');
  const now = new Date();
  const daysAgo = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

  // Build query based on whether we're filtering by project
  const baseMatch = { createdAt: { $gte: daysAgo } };
  const matchQuery = projectId 
    ? { ...baseMatch, projectId }
    : baseMatch;

  const [
    totalVisits,
    recentVisits,
    dailyStats,
    projectStats,
    topProjects,
    uniqueVisitors
  ] = await Promise.all([
    // Total visits count
    visitsCollection.countDocuments(projectId ? { projectId } : {}),
    
    // Recent visits
    visitsCollection.find(projectId ? { projectId } : {}).sort({ createdAt: -1 }).limit(recent).toArray(),
    
    // Daily statistics
    visitsCollection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray(),
    
    // Project-specific statistics
    projectId ? null : visitsCollection.aggregate([
      { $match: { visitType: 'project', createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: "$projectId",
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$ipHash" }
        }
      },
      {
        $project: {
          projectId: "$_id",
          visits: 1,
          uniqueVisitors: { $size: "$uniqueVisitors" }
        }
      },
      { $sort: { visits: -1 } }
    ]).toArray(),
    
    // Top projects
    projectId ? null : visitsCollection.aggregate([
      { $match: { visitType: 'project', createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: "$projectId",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray(),
    
    // Unique visitors count
    visitsCollection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          uniqueVisitors: { $addToSet: "$ipHash" }
        }
      }
    ]).toArray()
  ]);

  const response = createSuccessResponse(
    {
      totalVisits,
      recentVisits: recentVisits.length,
      dailyStats,
      projectStats: projectStats || [],
      topProjects: topProjects || [],
      uniqueVisitors: uniqueVisitors[0]?.uniqueVisitors?.length || 0,
      filteredProject: projectId
    },
    `Visit summary retrieved successfully for ${projectId ? `project ${projectId}` : 'all pages'}`,
    {
      period: `${days} days`,
      recentEntries: recent,
      projectId: projectId || 'all',
      generatedAt: new Date().toISOString()
    }
  );

  return setCorsHeaders(response);
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

