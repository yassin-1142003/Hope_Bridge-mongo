import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  createSuccessResponse, 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  handleApiError, 
  setCorsHeaders 
} from "@/lib/apiResponse";
import { UserRole, hasPermission } from "@/lib/roles";
import { TaskService } from "@/lib/services/TaskService";

const taskService = new TaskService();

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

// GET - Get tasks needing alerts (for cron job or admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }

    const userRole = session.user.role as UserRole;
    
    // Only users with analytics or management permissions can view alerts
    if (!hasPermission(userRole, 'canViewAnalytics')) {
      return setCorsHeaders(createForbiddenResponse("Insufficient permissions to view alerts"));
    }

    const tasksNeedingAlerts = await taskService.getTasksNeedingAlerts();
    
    return setCorsHeaders(createSuccessResponse({
      tasks: tasksNeedingAlerts,
      count: tasksNeedingAlerts.length,
      timestamp: new Date().toISOString()
    }));
    
  } catch (error) {
    console.error("Error getting task alerts:", error);
    return setCorsHeaders(handleApiError(error));
  }
}

// POST - Send alerts (for automated alert system)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }

    const userRole = session.user.role as UserRole;
    
    // Only users with analytics or management permissions can trigger alerts
    if (!hasPermission(userRole, 'canViewAnalytics')) {
      return setCorsHeaders(createForbiddenResponse("Insufficient permissions to send alerts"));
    }

    const tasksNeedingAlerts = await taskService.getTasksNeedingAlerts();
    const sentAlerts = [];
    
    // Here you would implement actual alert sending logic
    // For example: email notifications, push notifications, etc.
    for (const task of tasksNeedingAlerts) {
      try {
        // Send alert logic would go here
        // await sendEmailAlert(task.assignedTo, task.title, task.endDate);
        
        sentAlerts.push({
          taskId: task._id,
          taskTitle: task.title,
          assignedTo: task.assignedTo,
          alertMessage: `Task "${task.title}" is due on ${task.endDate.toLocaleDateString()}`,
          sentAt: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Failed to send alert for task ${task._id}:`, error);
      }
    }
    
    return setCorsHeaders(createSuccessResponse({
      sentAlerts,
      totalProcessed: tasksNeedingAlerts.length,
      totalSent: sentAlerts.length,
      timestamp: new Date().toISOString()
    }));
    
  } catch (error) {
    console.error("Error sending task alerts:", error);
    return setCorsHeaders(handleApiError(error));
  }
}
