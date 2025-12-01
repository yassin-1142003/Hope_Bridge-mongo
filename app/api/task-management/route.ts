/**
 * Task Management System API Routes
 * 
 * Complete task management with role-based access control,
 * form submissions, file attachments, and comprehensive tracking.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { 
  createSuccessResponse, 
  createCreatedResponse, 
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

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(1, "Description is required").max(2000, "Description too long"),
  assignedTo: z.string().min(1, "Assigned user is required"),
  assignedToName: z.string().min(1, "Assigned user name is required"),
  assignedToRole: z.enum(['SUPER_ADMIN', 'ADMIN', 'GENERAL_MANAGER', 'PROGRAM_MANAGER', 'PROJECT_COORDINATOR', 'HR', 'FINANCE', 'PROCUREMENT', 'STOREKEEPER', 'ME_OFFICER', 'FIELD_OFFICER', 'ACCOUNTANT', 'USER']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  formData: z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(2000),
    fields: z.array(z.object({
      id: z.string(),
      type: z.enum(['text', 'textarea', 'number', 'email', 'date', 'select', 'checkbox', 'radio', 'file']),
      label: z.string(),
      placeholder: z.string().optional(),
      required: z.boolean(),
      options: z.array(z.string()).optional(),
      validation: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional()
      }).optional()
    })).min(1, "At least one form field is required"),
    instructions: z.string().optional()
  }),
  attachments: z.array(z.object({
    id: z.string(),
    filename: z.string(),
    originalName: z.string(),
    mimeType: z.string(),
    size: z.number(),
    url: z.string(),
    uploadedBy: z.string()
  })).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).optional(),
  estimatedHours: z.number().positive().optional(),
  dueDate: z.string().optional()
});

const submitTaskSchema = z.object({
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

const reviewTaskSchema = z.object({
  reviewComment: z.string().min(1, "Review comment is required").max(1000)
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.string().optional(),
  priority: z.string().optional(),
  assignedTo: z.string().optional(),
  assignedBy: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional(),
  search: z.string().optional()
});

// Initialize task management service
const taskService = TaskManagementService.getInstance();

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

// GET - Get tasks (GM sees all, users see their own)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }

    const { searchParams } = new URL(request.url);
    const validatedQuery = querySchema.parse(Object.fromEntries(searchParams));
    
    const filters = {
      status: validatedQuery.status,
      priority: validatedQuery.priority,
      assignedTo: validatedQuery.assignedTo,
      assignedBy: validatedQuery.assignedBy,
      category: validatedQuery.category,
      tags: validatedQuery.tags,
      dateRange: validatedQuery.dateRange,
      search: validatedQuery.search
    };

    const query = {
      page: validatedQuery.page,
      limit: validatedQuery.limit,
      sortBy: validatedQuery.sortBy,
      sortOrder: validatedQuery.sortOrder,
      filters
    };

    let result;
    const userRole = session.user.role as UserRole;
    
    // GM sees all tasks, others see only their assigned tasks
    if (userRole === 'GENERAL_MANAGER' || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
      result = await taskService.getTasksForGM(query, session.user.id);
    } else {
      result = await taskService.getTasksForUser(session.user.id, query);
    }

    const response = createSuccessResponse(
      result.tasks,
      `Successfully retrieved ${result.tasks.length} tasks`,
      {
        pagination: result.pagination,
        total: result.total,
        filters: filters,
        count: result.tasks.length,
        userRole: userRole,
        viewMode: userRole === 'GENERAL_MANAGER' || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' ? 'ALL_TASKS' : 'MY_TASKS'
      }
    );
    
    return setCorsHeaders(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return setCorsHeaders(createBadRequestResponse(
        error.issues.map((e: any) => e.message).join(', ')
      ));
    }
    return handleApiError(error, "Fetching tasks");
  }
}

// POST - Create new task (GM only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }

    const userRole = session.user.role as UserRole;
    
    // Only GM can create tasks
    if (userRole !== 'GENERAL_MANAGER' && userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
      return setCorsHeaders(createForbiddenResponse("Only General Manager can create tasks"));
    }

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    const taskData = {
      title: validatedData.title,
      description: validatedData.description,
      assignedTo: validatedData.assignedTo,
      assignedToName: validatedData.assignedToName,
      assignedToRole: validatedData.assignedToRole,
      priority: validatedData.priority,
      formData: validatedData.formData,
      attachments: validatedData.attachments || [],
      category: validatedData.category,
      tags: validatedData.tags || [],
      estimatedHours: validatedData.estimatedHours,
      dueDate: validatedData.dueDate
    };

    const task = await taskService.createTask(
      taskData,
      session.user.id,
      session.user.name,
      userRole
    );

    const response = createCreatedResponse(
      task,
      "Task created successfully"
    );
    
    return setCorsHeaders(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return setCorsHeaders(createBadRequestResponse(
        error.issues.map((e: any) => e.message).join(', ')
      ));
    }
    return handleApiError(error, "Creating task");
  }
}
