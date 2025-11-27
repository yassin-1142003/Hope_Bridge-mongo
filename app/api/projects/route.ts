import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth";
import { ProjectService } from "@/lib/services/ProjectService";

const projectService = new ProjectService();

// Helper function to set CORS headers
const setCorsHeaders = (response: NextResponse) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

// GET - Get all projects (public)
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching fresh projects from MongoDB...');
    const projects = await projectService.getAll();
    console.log(`✅ Retrieved ${projects.length} projects from MongoDB`);
    
    // Debug: Log first project structure
    if (projects.length > 0) {
      console.log('🔍 First project in API:', {
        _id: projects[0]._id,
        idType: typeof projects[0]._id,
        bannerPhotoUrl: projects[0].bannerPhotoUrl?.substring(0, 50),
        galleryCount: projects[0].gallery?.length,
        contentsCount: projects[0].contents?.length
      });
    }
    
    // Create response with CORS headers
    const response = NextResponse.json({
      success: true,
      message: "Projects retrieved successfully",
      data: projects,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      status: 200
    });

    return setCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching projects:", error);
    const response = NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch projects" 
      },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}

// POST - Create new project with media (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role === "USER") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    
    let project;
    
    if (contentType.includes("multipart/form-data")) {
      // Handle FormData (with files)
      console.log('📁 Processing FormData request...');
      
      const formData = await request.formData();
      
      // Extract project data
      const projectDataStr = formData.get("projectData") as string;
      if (!projectDataStr) {
        console.log('❌ Missing projectData in FormData');
        return NextResponse.json(
          { success: false, error: "Missing project data" },
          { status: 400 }
        );
      }

      const projectData = JSON.parse(projectDataStr);
      console.log('📋 Project data parsed:', projectData);
      
      // Extract files
      const bannerFile = formData.get("banner") as File | undefined;
      const galleryFiles = formData.getAll("gallery") as File[] | undefined;
      
      console.log('🖼️ Files found:', {
        banner: bannerFile?.name || 'none',
        gallery: galleryFiles?.length || 0
      });
      
      // Validate required fields
      if (!projectData.contents || !Array.isArray(projectData.contents)) {
        console.log('❌ Invalid contents structure');
        return NextResponse.json(
          { success: false, error: "Missing required fields: contents" },
          { status: 400 }
        );
      }

      if (bannerFile || (galleryFiles && galleryFiles.length > 0)) {
        // Create project with media
        project = await projectService.createWithMedia(
          projectData,
          bannerFile,
          galleryFiles
        );
      } else {
        // Create project without media
        project = await projectService.create(projectData);
      }
    } else {
      // Handle JSON (no files)
      console.log('📄 Processing JSON request...');
      
      const data = await request.json();
      console.log('📋 JSON data received:', data);
      
      // Validate required fields
      if (!data.contents || !Array.isArray(data.contents)) {
        console.log('❌ Invalid contents structure in JSON');
        return NextResponse.json(
          { success: false, error: "Missing required fields: contents" },
          { status: 400 }
        );
      }

      project = await projectService.create(data);
    }

    console.log('✅ Project created successfully:', project._id);
    
    return NextResponse.json({
      success: true,
      message: "Project created successfully",
      data: project
    }, { status: 201 });
    
  } catch (error) {
    console.error("❌ Error creating project:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: "Failed to create project", details: errorMessage },
      { status: 500 }
    );
  }
}
