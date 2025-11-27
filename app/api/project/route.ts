import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { withErrorHandler } from "@/withErrorHandler";
import { verifyAdminToken } from "@/lib/auth";

// 🔒 POST (protected: only admin can create project)
async function postProject(req: NextRequest) {
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

  const data = await req.json();

  // Create project in MongoDB
  const projectsCollection = await getCollection('projects');
  const project = {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await projectsCollection.insertOne(project);
  const savedProject = { ...project, _id: result.insertedId };

  return NextResponse.json({
    message: "Project created successfully.",
    success: true,
    details: savedProject
  }, { status: 201 });
}

async function getAllProjects() {
  // Get all projects from MongoDB
  const projectsCollection = await getCollection('projects');
  const allProjects = await projectsCollection
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({
    message: "Projects retrieved successfully.",
    success: true,
    details: allProjects
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "CDN-Cache-Control": "public, s-maxage=300",
      "Vercel-CDN-Cache-Control": "public, s-maxage=300",
    },
  });
}

export const POST = withErrorHandler(postProject);
export const GET = withErrorHandler(getAllProjects);
