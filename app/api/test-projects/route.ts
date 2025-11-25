// Test endpoint that bypasses authentication for project creation
import { NextRequest, NextResponse } from "next/server";
import { ProjectService } from "@/lib/services/ProjectService";

const projectService = new ProjectService();

// POST - Create project without authentication (for testing only)
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test endpoint: Creating project without authentication...');
    
    const data = await request.json();
    console.log('📋 Received data:', data);
    
    // Validate required fields
    if (!data.contents || !Array.isArray(data.contents)) {
      console.log('❌ Invalid contents structure');
      return NextResponse.json(
        { success: false, error: "Missing required fields: contents" },
        { status: 400 }
      );
    }

    // Validate each content has required fields
    for (const content of data.contents) {
      if (!content.language_code || !content.name) {
        console.log('❌ Content missing required fields:', content);
        return NextResponse.json(
          { success: false, error: "Each content must have language_code and name" },
          { status: 400 }
        );
      }
    }

    // Create project
    const project = await projectService.createProject(data);
    
    console.log('✅ Test project created successfully:', project.id);
    
    return NextResponse.json({
      success: true,
      message: "Test project created successfully",
      data: project
    }, { status: 201 });
    
  } catch (error) {
    console.error("❌ Error creating test project:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: "Failed to create project", details: errorMessage },
      { status: 500 }
    );
  }
}

// GET - Get all projects without authentication (for testing)
export async function GET() {
  try {
    console.log('🧪 Test endpoint: Getting all projects...');
    
    const projects = await projectService.getAllProjects();
    
    console.log(`✅ Retrieved ${projects.length} projects`);
    
    return NextResponse.json({
      success: true,
      message: "Projects retrieved successfully",
      data: projects
    });
    
  } catch (error) {
    console.error("❌ Error getting projects:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: "Failed to get projects", details: errorMessage },
      { status: 500 }
    );
  }
}
