import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MediaService } from "@/lib/services/MediaService";

const mediaService = new MediaService();

// GET - Get all media files (admin only)
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    
    let mediaFiles;
    if (type) {
      mediaFiles = await mediaService.getMediaByType(type);
    } else {
      mediaFiles = await mediaService.getAllMedia();
    }
    
    return NextResponse.json({
      success: true,
      message: "Media files retrieved successfully",
      data: mediaFiles
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// POST - Upload media files (admin only)
export async function POST(request: NextRequest) {
  try {
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

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    // Validate files
    const allowedTypes = ["image/", "video/", "application/pdf"];
    const maxSizeInMB = 10; // 10MB max file size
    
    for (const file of files) {
      if (!mediaService.validateFileType(file, allowedTypes)) {
        return NextResponse.json(
          { success: false, error: `Invalid file type: ${file.type}` },
          { status: 400 }
        );
      }
      
      if (!mediaService.validateFileSize(file, maxSizeInMB)) {
        return NextResponse.json(
          { success: false, error: `File too large: ${file.name} (max ${maxSizeInMB}MB)` },
          { status: 400 }
        );
      }
    }

    const uploadedFiles = await mediaService.uploadMultipleFiles(files);
    
    return NextResponse.json({
      success: true,
      message: "Files uploaded successfully",
      data: uploadedFiles
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
