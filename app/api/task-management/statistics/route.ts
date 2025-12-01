/**
 * Task Management Statistics API
 * 
 * Provides dashboard statistics for task management
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { 
  createSuccessResponse, 
  createUnauthorizedResponse, 
  handleApiError, 
  setCorsHeaders 
} from "@/lib/apiResponse";
import { TaskManagementService } from "@/lib/services/TaskManagementService";

// Initialize task management service
const taskService = TaskManagementService.getInstance();

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

// GET - Get task statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }

    const statistics = await taskService.getTaskStatistics(
      session.user.id,
      session.user.role as any
    );

    const response = createSuccessResponse(
      statistics,
      "Task statistics retrieved successfully"
    );
    
    return setCorsHeaders(response);
  } catch (error) {
    return handleApiError(error, "Fetching task statistics");
  }
}
