/**
 * Available Users API for Task Assignment
 * 
 * Returns list of users that GM can assign tasks to
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { 
  createSuccessResponse, 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
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

// GET - Get available users for task assignment (GM only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }

    const userRole = session.user.role as string;
    
    // Only GM can view users for assignment
    if (userRole !== 'GENERAL_MANAGER' && userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
      return setCorsHeaders(createForbiddenResponse("Only General Manager can assign tasks"));
    }

    const users = await taskService.getAvailableUsers(userRole as any);

    const response = createSuccessResponse(
      users,
      `Retrieved ${users.length} available users for task assignment`
    );
    
    return setCorsHeaders(response);
  } catch (error) {
    return handleApiError(error, "Fetching available users");
  }
}
