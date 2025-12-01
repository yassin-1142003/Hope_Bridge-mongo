<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server';
import { getTaskManagementModels } from '@/lib/database/models/taskManagement';
import DatabaseManager from '@/lib/database';

// GET all tasks
export async function GET(request: NextRequest) {
  try {
    // Ensure database is connected
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isConnected('taskManagement')) {
      await dbManager.connect('taskManagement');
    }

    const { Task } = getTaskManagementModels();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const category = searchParams.get('category');

    // Build query
    const query: any = {};
    if (status) query.status = status.toUpperCase();
    if (priority) query.priority = priority.toUpperCase();
    if (assignedTo) query.assignedTo = assignedTo;
    if (category) query.category = category.toUpperCase();

    // Get tasks with pagination and populate
    const skip = (page - 1) * limit;
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tasks',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST create new task
export async function POST(request: NextRequest) {
  try {
    // Ensure database is connected
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isConnected('taskManagement')) {
      await dbManager.connect('taskManagement');
    }

    const { Task } = getTaskManagementModels();
    const body = await request.json();

    // Create new task
    const task = new Task(body);
    await task.save();

    // Populate related data
    await task.populate('assignedTo', 'name email avatar role');
    await task.populate('createdBy', 'name email avatar');
    if (task.project) {
      await task.populate('project', 'name status');
    }

    return NextResponse.json({
      success: true,
      data: task,
      message: 'Task created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create task',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
=======
/**
 * Professional Task Management API Routes
 * 
 * Handles CRUD operations for tasks with comprehensive validation,
 * file upload support, security measures, and activity logging.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
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
import { taskNotificationService } from '@/lib/services/TaskNotificationService';
import { UserRole, hasPermission } from "@/lib/roles";
import { z } from "zod";

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(2000, "Description too long").optional(),
  assignedTo: z.string().email("Valid email required for assignedTo"),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  startDate: z.string().refine(date => !isNaN(Date.parse(date)), "Invalid start date"),
  endDate: z.string().refine(date => !isNaN(Date.parse(date)), "Invalid end date"),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  alertBeforeDue: z.boolean().default(false),
  alertDays: z.number().int().min(1).max(30).default(1),
  tags: z.array(z.string().max(50)).optional(),
  category: z.string().max(100).optional()
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be after start date"
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  assignedTo: z.string().email().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  startDate: z.string().refine(date => !isNaN(Date.parse(date)), "Invalid start date").optional(),
  endDate: z.string().refine(date => !isNaN(Date.parse(date)), "Invalid end date").optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  alertBeforeDue: z.boolean().optional(),
  alertDays: z.number().int().min(1).max(30).optional(),
  tags: z.array(z.string().max(50)).optional(),
  category: z.string().max(100).optional()
});

const querySchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  assignedTo: z.string().email().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.string().max(100).optional(),
  search: z.string().max(100).optional(),
  page: z.string().transform(Number).refine(n => n > 0, "Page must be positive").default(1),
  limit: z.string().transform(Number).refine(n => n > 0 && n <= 100, "Limit must be between 1-100").default(10),
  sortBy: z.enum(['createdAt', 'updatedAt', 'startDate', 'endDate', 'priority']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Professional task manager with comprehensive features
class ProfessionalTaskManager {
  async createTask(taskData: any, session: any, files?: any[]): Promise<any> {
    try {
      const tasksCollection = await getCollection('tasks');
      
      // Check for duplicate tasks
      const existingTask = await tasksCollection.findOne({
        title: taskData.title,
        assignedTo: taskData.assignedTo,
        createdBy: session.user.email,
        status: { $ne: 'cancelled' }
      });
      
      if (existingTask) {
        throw new Error('A task with the same title already exists for this user');
      }
      
      // Validate assigned user exists
      const usersCollection = await getCollection('users');
      const assignedUser = await usersCollection.findOne({ email: taskData.assignedTo });
      
      if (!assignedUser) {
        throw new Error('Assigned user not found');
      }
      
      const task = {
        _id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
        ...taskData,
        createdBy: session.user.email,
        createdByName: session.user.name,
        assignedToName: assignedUser.name,
        createdAt: new Date(),
        updatedAt: new Date(),
        files: files || [],
        tags: taskData.tags || [],
        category: taskData.category || 'general'
      };
      
      await tasksCollection.insertOne(task);
      
      // Send notification to assigned user
      await taskNotificationService.notifyTaskAssignment(
        task._id,
        task,
        task.assignedTo,
        session.user.email
      );
      
      // Log activity
      await this.logActivity({
        userId: session.user.email,
        action: 'CREATE',
        entityType: 'task',
        entityId: task._id,
        entityName: task.title,
        description: `Task created: ${task.title}`,
        metadata: {
          assignedTo: task.assignedTo,
          priority: task.priority,
          category: task.category,
          hasFiles: files && files.length > 0
        }
      });
      
      return task;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }
  
  async updateTask(taskId: string, updates: any, session: any): Promise<any> {
    try {
      const tasksCollection = await getCollection('tasks');
      
      // Check if task exists and user has permission
      const existingTask = await tasksCollection.findOne({ _id: new ObjectId(taskId) });
      
      if (!existingTask) {
        throw new Error('Task not found');
      }
      
      // Check permissions (user can update their own tasks or tasks assigned to them)
      const canUpdate = existingTask.createdBy === session.user.email || 
                       existingTask.assignedTo === session.user.email ||
                       hasPermission(session.user.role as UserRole, 'canAssignTasks');
      
      if (!canUpdate) {
        throw new Error('Insufficient permissions to update this task');
      }
      
      // Validate assigned user if being updated
      if (updates.assignedTo && updates.assignedTo !== existingTask.assignedTo) {
        const usersCollection = await getCollection('users');
        const assignedUser = await usersCollection.findOne({ email: updates.assignedTo });
        
        if (!assignedUser) {
          throw new Error('Assigned user not found');
        }
        
        updates.assignedToName = assignedUser.name;
        
        // Send notification to newly assigned user
        await taskNotificationService.notifyTaskAssignment(
          taskId,
          { ...existingTask, ...updates },
          updates.assignedTo,
          session.user.email
        );
      }
      
      // Update task
      const result = await tasksCollection.updateOne(
        { _id: new ObjectId(taskId) },
        { 
          $set: { 
            ...updates, 
            updatedAt: new Date(),
            updatedBy: session.user.email
          } 
        }
      );
      
      if (result.matchedCount === 0) {
        throw new Error('Task not found');
      }
      
      // Get updated task
      const updatedTask = await tasksCollection.findOne({ _id: new ObjectId(taskId) });
      
      if (!updatedTask) {
        throw new Error('Task not found after update');
      }
      
      // Log activity
      await this.logActivity({
        userId: session.user.email,
        action: 'UPDATE',
        entityType: 'task',
        entityId: taskId,
        entityName: updatedTask.title,
        description: `Task updated: ${updatedTask.title}`,
        metadata: {
          changes: updates,
          previousStatus: existingTask.status,
          newStatus: updatedTask.status
        }
      });
      
      // Send status change notification
      if (updates.status && updates.status !== existingTask.status) {
        if (updates.status === 'completed') {
          await taskNotificationService.notifyTaskCompletion(
            taskId,
            updatedTask,
            session.user.email
          );
        } else if (updates.status === 'cancelled') {
          await taskNotificationService.notifyTaskCancellation(
            taskId,
            updatedTask,
            session.user.email
          );
        } else {
          await taskNotificationService.notifyTaskUpdate(
            taskId,
            updatedTask,
            { status: updates.status, previousStatus: existingTask.status },
            session.user.email
          );
        }
      }
      
      return updatedTask;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  }
  
  async getTasks(query: any, session: any): Promise<{ tasks: any[]; total: number; pagination: any }> {
    try {
      const tasksCollection = await getCollection('tasks');
      
      // Build query - users can see their own tasks or tasks assigned to them
      const dbQuery: any = {
        $or: [
          { createdBy: session.user.email },
          { assignedTo: session.user.email }
        ]
      };
      
      // Add filters
      if (query.status) dbQuery.status = query.status;
      if (query.assignedTo) dbQuery.assignedTo = query.assignedTo;
      if (query.priority) dbQuery.priority = query.priority;
      if (query.category) dbQuery.category = query.category;
      
      // Add search filter
      if (query.search) {
        const searchRegex = new RegExp(query.search, 'i');
        dbQuery.$and = dbQuery.$and || [];
        dbQuery.$and.push({
          $or: [
            { title: { $regex: searchRegex } },
            { description: { $regex: searchRegex } },
            { tags: { $in: [searchRegex] } },
            { category: { $regex: searchRegex } }
          ]
        });
      }
      
      // Get total count
      const total = await tasksCollection.countDocuments(dbQuery);
      
      // Build sort
      const sort: any = {};
      sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;
      
      // Get tasks with pagination
      const skip = (query.page - 1) * query.limit;
      const tasks = await tasksCollection
        .find(dbQuery)
        .sort(sort)
        .skip(skip)
        .limit(query.limit)
        .toArray();
      
      return {
        tasks,
        total,
        pagination: {
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(total / query.limit),
          hasNext: query.page * query.limit < total,
          hasPrev: query.page > 1
        }
      };
    } catch (error) {
      console.error('Failed to get tasks:', error);
      throw error;
    }
  }
  
  async deleteTask(taskId: string, session: any): Promise<any> {
    try {
      const tasksCollection = await getCollection('tasks');
      
      // Check if task exists and user has permission
      const existingTask = await tasksCollection.findOne({ _id: new ObjectId(taskId) });
      
      if (!existingTask) {
        throw new Error('Task not found');
      }
      
      // Check permissions (user can delete their own tasks or admins can delete any)
      const canDelete = existingTask.createdBy === session.user.email || 
                       hasPermission(session.user.role as UserRole, 'canCreateTasks');
      
      if (!canDelete) {
        throw new Error('Insufficient permissions to delete this task');
      }
      
      // Soft delete (mark as cancelled)
      const result = await tasksCollection.updateOne(
        { _id: new ObjectId(taskId) },
        { 
          $set: { 
            status: 'cancelled',
            updatedAt: new Date(),
            updatedBy: session.user.email,
            deletedAt: new Date(),
            deletedBy: session.user.email
          } 
        }
      );
      
      if (result.matchedCount === 0) {
        throw new Error('Task not found');
      }
      
      // Log activity
      await this.logActivity({
        userId: session.user.email,
        action: 'DELETE',
        entityType: 'task',
        entityId: taskId,
        entityName: existingTask.title,
        description: `Task deleted: ${existingTask.title}`,
        metadata: {
          originalStatus: existingTask.status,
          assignedTo: existingTask.assignedTo
        }
      });
      
      return result;
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  }
  
  private async sendTaskNotification(task: any, type: 'assigned' | 'status_change'): Promise<void> {
    try {
      const notificationsCollection = await getCollection('notifications');
      
      let title, message, notificationType;
      
      if (type === 'assigned') {
        title = 'New Task Assigned';
        message = `You have been assigned a new task: ${task.title}`;
        notificationType = 'task_assigned';
      } else {
        title = 'Task Status Updated';
        message = `Task "${task.title}" status changed to ${task.status}`;
        notificationType = 'task_completed';
        if (task.status !== 'completed') {
          notificationType = 'task_updated';
        }
      }
      
      const notification = {
        _id: new ObjectId(),
        title,
        message,
        type: notificationType,
        userId: task.assignedTo,
        priority: task.priority === 'urgent' ? 'urgent' : 'medium',
        actionUrl: '/dashboard/tasks',
        actionText: 'View Task',
        metadata: {
          taskId: task._id,
          taskTitle: task.title,
          taskStatus: task.status
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        read: false,
        archived: false,
        createdBy: 'system',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };
      
      await notificationsCollection.insertOne(notification);
    } catch (error) {
      console.error('Failed to send task notification:', error);
      // Don't throw - notification failure shouldn't break task operations
    }
  }
  
  private async logActivity(activity: any): Promise<void> {
    try {
      const activityCollection = await getCollection('activity');
      await activityCollection.insertOne({
        ...activity,
        createdAt: new Date(),
        ipAddress: activity.metadata?.ipAddress || 'unknown',
        userAgent: activity.metadata?.userAgent || 'unknown'
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}

// Initialize professional task manager
const taskManager = new ProfessionalTaskManager();

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

// GET - Get tasks with advanced filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required to access tasks"));
    }

    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const validatedQuery = querySchema.parse(Object.fromEntries(searchParams));
    
    // Add client request info to metadata
    const metadata = {
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    const result = await taskManager.getTasks(validatedQuery, session);
    
    const response = createSuccessResponse(
      result.tasks,
      `Successfully retrieved ${result.tasks.length} tasks`,
      {
        pagination: result.pagination,
        total: result.total,
        filters: {
          status: validatedQuery.status || undefined,
          assignedTo: validatedQuery.assignedTo || undefined,
          priority: validatedQuery.priority || undefined
        },
        count: result.tasks.length,
        metadata
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

// POST - Create new task with comprehensive validation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required to create tasks"));
    }

    // Check if user has permission to create tasks
    if (!hasPermission(session.user.role as UserRole, 'canCreateTasks')) {
      return setCorsHeaders(createForbiddenResponse("Insufficient permissions to create tasks"));
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = createTaskSchema.parse(body);

    // Handle file uploads if any
    let uploadedFiles: any[] = [];
    const contentType = request.headers.get('content-type');
    
    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle multipart form data with files
      const formData = await request.formData();
      
      // Extract files from form data
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('file_') && value instanceof File) {
          const file = value;
          const fileData = {
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            url: `/uploads/tasks/${file.name}`, // In production, store in cloud storage
            uploadedAt: new Date().toISOString()
          };
          uploadedFiles.push(fileData);
        }
      }
    }

    // Add client request info
    const taskData = {
      ...validatedData,
      metadata: {
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    };

    const task = await taskManager.createTask(taskData, session, uploadedFiles);
    
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

// PUT - Update task with validation and permissions
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required to update tasks"));
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      return setCorsHeaders(createBadRequestResponse("Task ID is required"));
    }

    const body = await request.json();
    
    // Validate request body
    const validatedUpdates = updateTaskSchema.parse(body);

    const updatedTask = await taskManager.updateTask(taskId, validatedUpdates, session);
    
    const response = createSuccessResponse(
      updatedTask,
      "Task updated successfully"
    );
    
    return setCorsHeaders(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return setCorsHeaders(createBadRequestResponse(
        error.issues.map((e: any) => e.message).join(', ')
      ));
    }
    return handleApiError(error, "Updating task");
  }
}

// DELETE - Delete task with soft delete and permissions
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required to delete tasks"));
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      return setCorsHeaders(createBadRequestResponse("Task ID is required"));
    }

    const result = await taskManager.deleteTask(taskId, session);
    
    const response = createSuccessResponse(
      { deleted: true, taskId },
      "Task deleted successfully"
    );
    
    return setCorsHeaders(response);
  } catch (error) {
    return handleApiError(error, "Deleting task");
  }
}

// PATCH - Bulk operations on tasks
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required for bulk operations"));
    }

    const body = await request.json();
    const { operation, taskIds, updates } = body;

    if (!operation || !taskIds || !Array.isArray(taskIds)) {
      return setCorsHeaders(createBadRequestResponse("Operation and taskIds array are required"));
    }

    let results: any[] = [];
    
    switch (operation) {
      case 'bulkUpdate':
        if (!updates) {
          return setCorsHeaders(createBadRequestResponse("Updates are required for bulk update"));
        }
        
        const validatedUpdates = updateTaskSchema.parse(updates);
        
        for (const taskId of taskIds) {
          try {
            const result = await taskManager.updateTask(taskId, validatedUpdates, session);
            results.push({ taskId, success: true, task: result });
          } catch (error) {
            results.push({ taskId, success: false, error: (error as Error).message });
          }
        }
        break;
        
      case 'bulkDelete':
        for (const taskId of taskIds) {
          try {
            const result = await taskManager.deleteTask(taskId, session);
            results.push({ taskId, success: true, deleted: true });
          } catch (error) {
            results.push({ taskId, success: false, error: (error as Error).message });
          }
        }
        break;
        
      default:
        return setCorsHeaders(createBadRequestResponse("Invalid operation. Use 'bulkUpdate' or 'bulkDelete'"));
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    const response = createSuccessResponse(
      { results, successCount, failureCount },
      `Bulk ${operation} completed`
    );
    
    return setCorsHeaders(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return setCorsHeaders(createBadRequestResponse(
        error.issues.map((e: any) => e.message).join(', ')
      ));
    }
    return handleApiError(error, "Bulk operation");
>>>>>>> 2efbb4e38f6799641e973bb9be8bca702baa4001
  }
}
