import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProjectService } from "@/lib/services/ProjectService";

const projectService = new ProjectService();

// GET - Get single project by ID or slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: slugOrId } = await params;
    
    // Extract actual ID from slug or use direct ID
    const extractIdFromSlug = (slug: string): string => {
      // UUID format: 8-4-4-4-12 characters (with hyphens)
      const uuidRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i;
      const match = slug.match(uuidRegex);

      if (match) {
        return match[1];
      }

      // Fallback: if no UUID found, try to match ObjectId format (24 hex chars)
      const objectIdRegex = /([a-f0-9]{24})$/i;
      const objectIdMatch = slug.match(objectIdRegex);
      
      if (objectIdMatch) {
        return objectIdMatch[1];
      }

      // Final fallback: if the entire slug is a valid ObjectId
      if (/^[a-f0-9]{24}$/i.test(slug)) {
        return slug;
      }

      return slug; // Return as-is if no pattern matches
    };
    
    const actualId = extractIdFromSlug(slugOrId);
    console.log(`🔍 Looking for project with slug/ID: ${slugOrId} -> extracted ID: ${actualId}`);
    
    const project = await projectService.getProjectWithMedia(actualId);
    
    if (!project) {
      console.log(`❌ Project not found with ID: ${actualId}`);
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    console.log(`✅ Found project: ${project.contents?.find(c => c.language_code === 'en')?.name || 'Unknown'}`);
    
    return NextResponse.json({
      success: true,
      message: "Project retrieved successfully",
      data: project
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PATCH - Update project with media (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role === "user") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const contentType = request.headers.get("content-type");
    
    if (contentType?.includes("multipart/form-data")) {
      // Handle form data with files
      const formData = await request.formData();
      
      // Extract project data
      const projectDataStr = formData.get("projectData") as string;
      const projectData = projectDataStr ? JSON.parse(projectDataStr) : {};
      
      // Extract files
      const bannerFile = formData.get("banner") as File | undefined;
      const galleryFiles = formData.getAll("gallery") as File[] | undefined;
      const removeGalleryIds = formData.get("removeGalleryIds") as string;
      const removeIds = removeGalleryIds ? JSON.parse(removeGalleryIds) : [];
      
      // Update project with media
      const updatedProject = await projectService.updateProjectMedia(
        id,
        bannerFile,
        galleryFiles,
        removeIds
      );
      
      // Also update other project data if provided
      if (projectData && Object.keys(projectData).length > 0) {
        const { bannerPhotoUrl, gallery, ...otherData } = projectData;
        if (Object.keys(otherData).length > 0) {
          await projectService.updateProject(id, otherData);
        }
      }
      
      if (!updatedProject) {
        return NextResponse.json(
          { success: false, error: "Project not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Project updated successfully",
        data: updatedProject
      });
    } else {
      // Handle JSON data only
      const data = await request.json();
      const updatedProject = await projectService.updateProject(id, data);
      
      if (!updatedProject) {
        return NextResponse.json(
          { success: false, error: "Project not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Project updated successfully",
        data: updatedProject
      });
    }
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE - Delete project (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role === "user") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const deleted = await projectService.deleteProject(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
      data: { id }
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
