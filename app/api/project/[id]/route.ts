import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { withErrorHandler } from "@/withErrorHandler";
import { verifyAdminToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

async function getOneProjectById(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Get project from MongoDB
  const projectsCollection = await getCollection('projects');
  const project = await projectsCollection.findOne({ _id: new ObjectId(id) });

  if (!project) {
    return NextResponse.json(
      { error: "Project not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Project retrieved successfully.",
    success: true,
    details: project
  });
}

async function updateProject(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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

  // Update project in MongoDB
  const projectsCollection = await getCollection('projects');
  const result = await projectsCollection.updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: { 
        ...data, 
        updatedAt: new Date() 
      }
    }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json(
      { error: "Project not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Project updated successfully.",
    success: true
  });
}

async function deleteProject(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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

  // Delete project from MongoDB
  const projectsCollection = await getCollection('projects');
  const result = await projectsCollection.deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return NextResponse.json(
      { error: "Project not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Project deleted successfully.",
    success: true
  });
}

export const GET = withErrorHandler(getOneProjectById);
export const PATCH = withErrorHandler(updateProject);
export const DELETE = withErrorHandler(deleteProject);
