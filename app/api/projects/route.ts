import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth";
import { ProjectService } from "@/lib/services/ProjectService";
import { 
  createSuccessResponse, 
  createCreatedResponse, 
  createBadRequestResponse, 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  createNotFoundResponse, 
  createErrorResponse, 
  handleApiError, 
  setCorsHeaders 
} from "@/lib/apiResponse";

// Define Project interface to match the expected structure
interface Project {
  _id: string;
  contents: ProjectContent[];
  bannerPhotoUrl: string;
  bannerPhotoId?: string;
  gallery: string[];
  videos?: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectContent {
  language_code: string;
  name: string;
  description: string;
  content: string;
  images: string[];
  videos: string[];
  documents: string[];
}

const projectService = new ProjectService();

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
    
    // Create professional response
    const response = createSuccessResponse(
      projects,
      `Successfully retrieved ${projects.length} projects`,
      {
        count: projects.length,
        connectionStatus: 'connected',
        mediaStats: {
          totalImages: projects.reduce((sum, p) => sum + (p.gallery?.length || 0), 0),
          totalVideos: projects.reduce((sum, p) => sum + (p.videos?.length || 0), 0),
          projectsWithMedia: projects.filter(p => (p.gallery?.length || 0) > 0).length
        }
      }
    );

    // Add cache control headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return setCorsHeaders(response);
  } catch (error) {
    return handleApiError(error, "Fetching projects");
  }
}

// POST - Create new project with media (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required to create projects"));
    }

    if (session.user.role === "USER") {
      return setCorsHeaders(createForbiddenResponse("Admin access required to create projects"));
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
    
    const response = createCreatedResponse(
      project,
      "Project created successfully"
    );
    
    return setCorsHeaders(response);
    
  } catch (error) {
    return handleApiError(error, "Creating project");
  }
}
