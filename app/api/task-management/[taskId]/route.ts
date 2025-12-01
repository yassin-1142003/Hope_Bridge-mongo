/**
 * Individual Task Operations API
 * 
 * Handles task-specific operations like viewing, submitting, and reviewing
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { 
  createSuccessResponse, 
  createBadRequestResponse, 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  createNotFoundResponse, 
  handleApiError, 
  setCorsHeaders 
} from "@/lib/apiResponse";
import { TaskManagementService } from "@/lib/services/TaskManagementService";
import { UserRole } from "@/lib/roles";
import { z } from "zod";

// Initialize task management service
const taskService = TaskManagementService.getInstance();

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

// GET - Get single task by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }

    const taskId = params.taskId;
    const userRole = session.user.role as UserRole;

    const task = await taskService.getTaskById(taskId, session.user.id, userRole);

    const response = createSuccessResponse(
      task,
      "Task retrieved successfully"
    );
    
    return setCorsHeaders(response);
  } catch (error) {
    if (error instanceof Error && error.message === 'Task not found') {
      return setCorsHeaders(createNotFoundResponse("Task not found"));
    }
    if (error instanceof Error && error.message === 'Access denied to this task') {
      return setCorsHeaders(createForbiddenResponse("Access denied to this task"));
    }
    return handleApiError(error, "Fetching task");
  }
}

// PATCH - Update task status or other operations
export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }

    const taskId = params.taskId;
    const userRole = session.user.role as UserRole;
    const body = await request.json();

    // Determine operation type based on request body
    if (body.operation === 'submit_response') {
      // Submit task response (user only)
      const submitSchema = z.object({
        operation: z.literal('submit_response'),
        response: z.record(z.any()),
        uploadedFiles: z.array(z.object({
          id: z.string(),
          filename: z.string(),
          originalName: z.string(),
          mimeType: z.string(),
          size: z.number(),
          url: z.string(),
          uploadedBy: z.string()
        })).optional()
      });

      const validatedData = submitSchema.parse(body);

      const task = await taskService.submitTaskResponse(
        taskId,
        validatedData.response,
        validatedData.uploadedFiles || [],
        session.user.id,
        userRole
      );

      const response = createSuccessResponse(
        task,
        "Task submitted successfully for review"
      );
      
      return setCorsHeaders(response);

    } else if (body.operation === 'review_and_complete') {
      // Review and complete task (GM only)
      const reviewSchema = z.object({
        operation: z.literal('review_and_complete'),
        reviewComment: z.string().min(1, "Review comment is required").max(1000)
      });

      const validatedData = reviewSchema.parse(body);

      // Check if user can complete tasks
      if (userRole !== 'GENERAL_MANAGER' && userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
        return setCorsHeaders(createForbiddenResponse("Only General Manager can complete tasks"));
      }

      const task = await taskService.reviewAndCompleteTask(
        taskId,
        validatedData.reviewComment,
        session.user.id,
        userRole
      );

      const response = createSuccessResponse(
        task,
        "Task reviewed and completed successfully"
      );
      
      return setCorsHeaders(response);

    } else if (body.operation === 'update_status') {
      // Update task status
      const statusSchema = z.object({
        operation: z.literal('update_status'),
        status: z.enum(['PENDING', 'IN_PROGRESS', 'CANCELLED'])
      });

      const validatedData = statusSchema.parse(body);

      const task = await taskService.updateTaskStatus(
        taskId,
        validatedData.status,
        session.user.id,
        userRole
      );

      const response = createSuccessResponse(
        task,
        `Task status updated to ${validatedData.status}`
      );
      
      return setCorsHeaders(response);

    } else {
      return setCorsHeaders(createBadRequestResponse("Invalid operation specified"));
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return setCorsHeaders(createBadRequestResponse(
        error.issues.map((e: any) => e.message).join(', ')
      ));
    }
    if (error instanceof Error && error.message === 'Task not found') {
      return setCorsHeaders(createNotFoundResponse("Task not found"));
    }
    if (error instanceof Error && error.message === 'Access denied to this task') {
      return setCorsHeaders(createForbiddenResponse("Access denied to this task"));
    }
    return handleApiError(error, "Updating task");
  }
}
