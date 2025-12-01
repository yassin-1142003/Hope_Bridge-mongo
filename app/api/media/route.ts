import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MediaService } from "@/lib/services/MediaService";
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

const mediaService = new MediaService();

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

// GET - Get all media files (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required to access media"));
    }

    if (session.user.role === "USER") {
      return setCorsHeaders(createForbiddenResponse("Admin access required to access media"));
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    
    let mediaFiles;
    if (type) {
      mediaFiles = await mediaService.getMediaByType(type);
    } else {
      mediaFiles = await mediaService.getAllMedia();
    }
    
    const response = createSuccessResponse(
      mediaFiles,
      `Successfully retrieved ${mediaFiles.length} media files`,
      {
        count: mediaFiles.length,
        type: type || 'all',
        allowedTypes: ["image", "video", "document"]
      }
    );
    
    return setCorsHeaders(response);
  } catch (error) {
    return handleApiError(error, "Fetching media");
  }
}

// POST - Upload media files (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required to upload media"));
    }

    if (session.user.role === "USER") {
      return setCorsHeaders(createForbiddenResponse("Admin access required to upload media"));
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    
    if (!files || files.length === 0) {
      return setCorsHeaders(createBadRequestResponse("No files provided", "NO_FILES"));
    }

    // Validate files
    const allowedTypes = ["image/", "video/", "application/pdf"];
    const maxSizeInMB = 10; // 10MB max file size
    
    for (const file of files) {
      if (!mediaService.validateFileType(file, allowedTypes)) {
        return setCorsHeaders(createBadRequestResponse(
          `Invalid file type: ${file.type}`,
          "INVALID_FILE_TYPE",
          { allowedTypes, fileName: file.name }
        ));
      }
      
      if (!mediaService.validateFileSize(file, maxSizeInMB)) {
        return setCorsHeaders(createBadRequestResponse(
          `File too large: ${file.name} (max ${maxSizeInMB}MB)`,
          "FILE_TOO_LARGE",
          { fileName: file.name, maxSize: `${maxSizeInMB}MB` }
        ));
      }
    }

    const uploadedFiles = await mediaService.uploadMultipleFiles(files);
    
    const response = createCreatedResponse(
      uploadedFiles,
      `Successfully uploaded ${uploadedFiles.length} files`,
      {
        uploadedCount: uploadedFiles.length,
        fileNames: uploadedFiles.map(f => f.filename),
        totalSize: uploadedFiles.reduce((sum, f) => sum + (f.size || 0), 0)
      }
    );
    
    return setCorsHeaders(response);
    
  } catch (error) {
    return handleApiError(error, "Uploading media");
  }
}
