/**
 * Task Management API Routes
 * 
 * Handles CRUD operations for tasks with file upload support
 * including images and videos.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
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
import { UserRole, hasPermission } from "@/lib/roles";

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

// GET - Get all tasks (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required to access tasks"));
    }

    const userRole = session.user.role as UserRole;
    
    if (!hasPermission(userRole, 'canViewAllTasks')) {
      return setCorsHeaders(createForbiddenResponse("Insufficient permissions to access tasks"));
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const assignedTo = searchParams.get("assignedTo");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    const tasksCollection = await getCollection('tasks');
    
    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    
    // Get tasks with pagination
    const skip = (page - 1) * limit;
    const [tasks, total] = await Promise.all([
      tasksCollection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      tasksCollection.countDocuments(query)
    ]);
    
    const response = createSuccessResponse(
      tasks,
      `Successfully retrieved ${tasks.length} tasks`,
      {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        filters: { status: status || undefined, assignedTo: assignedTo || undefined },
        count: tasks.length
      }
    );
    
    return setCorsHeaders(response);
  } catch (error) {
    return handleApiError(error, "Fetching tasks");
  }
}

// POST - Create new task with file uploads (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required to create tasks"));
    }

    const userRole = session.user.role as UserRole;
    
    if (!hasPermission(userRole, 'canCreateTasks')) {
      return setCorsHeaders(createForbiddenResponse("Insufficient permissions to create tasks"));
    }

    const contentType = request.headers.get("content-type");
    let formData: FormData;
    let taskData: any;
    let files: File[] = [];

    // Handle both JSON and multipart form data
    if (contentType?.includes("multipart/form-data")) {
      formData = await request.formData();
      
      // Extract task data from form fields
      taskData = {
        title: formData.get("title"),
        description: formData.get("description"),
        assignedTo: formData.get("assignedTo"),
        priority: formData.get("priority") || "medium",
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        status: formData.get("status") || "pending",
        alertBeforeDue: formData.get("alertBeforeDue") === "true",
        alertDays: parseInt(formData.get("alertDays") as string) || 1
      };
      
      // Extract files
      files = formData.getAll("files") as File[];
      
    } else {
      // Handle JSON request
      taskData = await request.json();
      files = [];
    }

    // Validate required fields
    const requiredFields = ["title", "description", "assignedTo", "startDate", "endDate"];
    const missingFields = requiredFields.filter(field => !taskData[field]);
    
    // Validate date logic
    if (taskData.startDate && taskData.endDate) {
      const start = new Date(taskData.startDate);
      const end = new Date(taskData.endDate);
      if (start > end) {
        return setCorsHeaders(createBadRequestResponse(
          "Start date must be before end date",
          "INVALID_DATE_RANGE"
        ));
      }
    }
    
    if (missingFields.length > 0) {
      return setCorsHeaders(createBadRequestResponse(
        `Missing required fields: ${missingFields.join(", ")}`,
        "MISSING_FIELDS",
        { missingFields }
      ));
    }

    // Validate priority
    const validPriorities = ["low", "medium", "high", "urgent"];
    if (!validPriorities.includes(taskData.priority)) {
      return setCorsHeaders(createBadRequestResponse(
        `Invalid priority. Must be one of: ${validPriorities.join(", ")}`,
        "INVALID_PRIORITY",
        { validPriorities }
      ));
    }

    // Process file uploads if any
    let uploadedFiles: any[] = [];
    if (files && files.length > 0) {
      // Validate files
      const allowedTypes = [
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "video/mp4", "video/webm", "video/ogg",
        "application/pdf", "text/plain", "application/msword"
      ];
      const maxSizeInMB = 50; // 50MB max file size
      
      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          return setCorsHeaders(createBadRequestResponse(
            `Invalid file type: ${file.type}`,
            "INVALID_FILE_TYPE",
            { allowedTypes, fileName: file.name }
          ));
        }
        
        if (file.size > maxSizeInMB * 1024 * 1024) {
          return setCorsHeaders(createBadRequestResponse(
            `File too large: ${file.name} (max ${maxSizeInMB}MB)`,
            "FILE_TOO_LARGE",
            { fileName: file.name, maxSize: `${maxSizeInMB}MB` }
          ));
        }
      }

      // Upload files (you would implement actual file storage here)
      for (const file of files) {
        const fileData = {
          id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          originalName: file.name,
          type: file.type,
          size: file.size,
          url: `/uploads/tasks/${file.name}`, // This would be the actual stored file URL
          uploadedAt: new Date().toISOString()
        };
        uploadedFiles.push(fileData);
      }
    }

    // Create task document
    const tasksCollection = await getCollection('tasks');
    const task = {
      title: taskData.title,
      description: taskData.description,
      assignedTo: taskData.assignedTo,
      priority: taskData.priority,
      startDate: new Date(taskData.startDate),
      endDate: new Date(taskData.endDate),
      status: taskData.status,
      alertBeforeDue: taskData.alertBeforeDue || false,
      alertDays: taskData.alertDays || 1,
      files: uploadedFiles,
      createdBy: session.user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await tasksCollection.insertOne(task);
    
    const response = createCreatedResponse(
      { ...task, _id: result.insertedId },
      "Task created successfully",
      {
        filesCount: uploadedFiles.length,
        fileTypes: uploadedFiles.map(f => f.type),
        assignedTo: taskData.assignedTo,
        priority: taskData.priority
      }
    );
    
    return setCorsHeaders(response);
  } catch (error) {
    return handleApiError(error, "Creating task");
  }
}
