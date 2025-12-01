import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MediaService } from "@/lib/services/MediaService";

const mediaService = new MediaService();

// GET - Get single media file by ID (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const media = await mediaService.getMediaById(id);
    
    if (!media) {
      return NextResponse.json(
        { success: false, error: "Media file not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Media file retrieved successfully",
      data: media
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// DELETE - Delete media file (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const deleted = await mediaService.deleteMedia(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Media file not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Media file deleted successfully",
      data: { id }
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
