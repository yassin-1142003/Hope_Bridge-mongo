/**
 * Task Management Service
 * 
 * Complete business logic for task management system
 * with role-based access control and comprehensive features
 */

import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { hasPermission } from '@/lib/roles';
import { UserRole } from '@/lib/roles';
import { ITask, TaskForm, EmployeeResponse, TaskFile, TaskActivity, FormField } from '@/lib/mongodb/taskSchema';

export interface CreateTaskData {
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  assignedToRole: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  formData: TaskForm;
  attachments?: TaskFile[];
  category?: string;
  tags?: string[];
  estimatedHours?: number;
  dueDate?: string;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  assignedBy?: string;
  category?: string;
  tags?: string[];
  dateRange?: { start: string; end: string };
  search?: string;
}

export interface TaskQuery {
  page: number;
  limit: number;
  sortBy: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
  filters: TaskFilters;
}

export class TaskManagementService {
  private static instance: TaskManagementService;

  static getInstance(): TaskManagementService {
    if (!TaskManagementService.instance) {
      TaskManagementService.instance = new TaskManagementService();
    }
    return TaskManagementService.instance;
  }

  /**
   * Create a new task (GM only)
   */
  async createTask(data: CreateTaskData, createdBy: string, createdByName: string, creatorRole: UserRole): Promise<ITask> {
    // Check if user can create tasks
    if (!hasPermission(creatorRole, 'canCreateTasks')) {
      throw new Error('Insufficient permissions to create tasks');
    }

    // Validate assignment permissions (GM can assign to anyone)
    if (creatorRole !== 'GENERAL_MANAGER' && creatorRole !== 'SUPER_ADMIN' && creatorRole !== 'ADMIN') {
      throw new Error('Only General Manager can assign tasks to all users');
    }

    const tasksCollection = await getCollection('tasks');

    const task: Omit<ITask, '_id' | 'createdAt' | 'updatedAt'> = {
      title: data.title,
      description: data.description,
      assignedBy: createdBy,
      assignedByName: createdByName,
      assignedTo: data.assignedTo,
      assignedToName: data.assignedToName,
      assignedToRole: data.assignedToRole,
      status: 'PENDING',
      priority: data.priority,
      formData: data.formData,
      attachments: data.attachments || [],
      responseFiles: [],
      activities: [{
        id: new Date().getTime().toString(),
        action: 'CREATED',
        performedBy: createdBy,
        performedByRole: creatorRole,
        timestamp: new Date(),
        comment: `Task created and assigned to ${data.assignedToName}`
      }, {
        id: (new Date().getTime() + 1).toString(),
        action: 'ASSIGNED',
        performedBy: createdBy,
        performedByRole: creatorRole,
        timestamp: new Date(),
        comment: `Task assigned to ${data.assignedToName} (${data.assignedToRole})`
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      category: data.category,
      tags: data.tags || [],
      estimatedHours: data.estimatedHours,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined
    };

    const result = await tasksCollection.insertOne(task as any);
    
    // Return the created task with ID
    const createdTask = await tasksCollection.findOne({ _id: result.insertedId });
    
    if (!createdTask) {
      throw new Error('Failed to create task');
    }

    return createdTask as ITask;
  }

  /**
   * Get tasks for GM (all tasks in the system)
   */
  async getTasksForGM(query: TaskQuery, gmId: string): Promise<{
    tasks: ITask[];
    total: number;
    pagination: any;
  }> {
    const tasksCollection = await getCollection('tasks');
    
    // Build filter
    const filter: any = {};
    
    // Apply filters
    if (query.filters.status) {
      filter.status = query.filters.status;
    }
    
    if (query.filters.priority) {
      filter.priority = query.filters.priority;
    }
    
    if (query.filters.assignedTo) {
      filter.assignedTo = query.filters.assignedTo;
    }
    
    if (query.filters.assignedBy) {
      filter.assignedBy = query.filters.assignedBy;
    }
    
    if (query.filters.category) {
      filter.category = query.filters.category;
    }
    
    if (query.filters.tags && query.filters.tags.length > 0) {
      filter.tags = { $in: query.filters.tags };
    }
    
    if (query.filters.dateRange) {
      const dateFilter: any = {};
      if (query.filters.dateRange.start) {
        dateFilter.$gte = new Date(query.filters.dateRange.start);
      }
      if (query.filters.dateRange.end) {
        dateFilter.$lte = new Date(query.filters.dateRange.end);
      }
      filter.createdAt = dateFilter;
    }
    
    if (query.filters.search) {
      filter.$or = [
        { title: { $regex: query.filters.search, $options: 'i' } },
        { description: { $regex: query.filters.search, $options: 'i' } },
        { assignedToName: { $regex: query.filters.search, $options: 'i' } },
        { tags: { $regex: query.filters.search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await tasksCollection.countDocuments(filter);

    // Build sort
    const sort: any = {};
    sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;

    // Get tasks with pagination
    const skip = (query.page - 1) * query.limit;
    const tasks = await tasksCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .toArray() as ITask[];

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
  }

  /**
   * Get tasks assigned to a specific user
   */
  async getTasksForUser(userId: string, query: TaskQuery): Promise<{
    tasks: ITask[];
    total: number;
    pagination: any;
  }> {
    const tasksCollection = await getCollection('tasks');
    
    // Build filter for assigned tasks
    const filter: any = { assignedTo: userId };
    
    // Apply additional filters
    if (query.filters.status) {
      filter.status = query.filters.status;
    }
    
    if (query.filters.priority) {
      filter.priority = query.filters.priority;
    }
    
    if (query.filters.category) {
      filter.category = query.filters.category;
    }
    
    if (query.filters.tags && query.filters.tags.length > 0) {
      filter.tags = { $in: query.filters.tags };
    }
    
    if (query.filters.search) {
      filter.$or = [
        { title: { $regex: query.filters.search, $options: 'i' } },
        { description: { $regex: query.filters.search, $options: 'i' } },
        { tags: { $regex: query.filters.search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await tasksCollection.countDocuments(filter);

    // Build sort
    const sort: any = {};
    sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;

    // Get tasks with pagination
    const skip = (query.page - 1) * query.limit;
    const tasks = await tasksCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .toArray() as ITask[];

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
  }

  /**
   * Get a single task by ID
   */
  async getTaskById(taskId: string, requestingUserId: string, requestingUserRole: UserRole): Promise<ITask> {
    const tasksCollection = await getCollection('tasks');
    
    const task = await tasksCollection.findOne({ _id: new ObjectId(taskId) }) as ITask;
    
    if (!task) {
      throw new Error('Task not found');
    }

    // Check access permissions
    const canAccess = 
      task.assignedTo === requestingUserId || 
      task.assignedBy === requestingUserId ||
      hasPermission(requestingUserRole, 'canViewAllTasks');

    if (!canAccess) {
      throw new Error('Access denied to this task');
    }

    // Add viewed activity
    await this.addActivity(taskId, {
      action: 'VIEWED',
      performedBy: requestingUserId,
      performedByRole: requestingUserRole,
      comment: 'Task viewed'
    });

    return task;
  }

  /**
   * Submit task response (user only)
   */
  async submitTaskResponse(
    taskId: string, 
    response: EmployeeResponse, 
    uploadedFiles: TaskFile[], 
    userId: string, 
    userRole: UserRole
  ): Promise<ITask> {
    const tasksCollection = await getCollection('tasks');
    
    const task = await tasksCollection.findOne({ _id: new ObjectId(taskId) }) as ITask;
    
    if (!task) {
      throw new Error('Task not found');
    }

    // Check if user can submit this task
    if (task.assignedTo !== userId) {
      throw new Error('You can only submit tasks assigned to you');
    }

    // Check if task is in a submittable state
    if (task.status === 'COMPLETED') {
      throw new Error('Cannot submit a completed task');
    }
    
    if (task.status === 'SUBMITTED') {
      throw new Error('Task has already been submitted');
    }

    // Validate required fields
    const missingFields = task.formData.fields
      .filter(field => field.required)
      .filter(field => !response[field.id] || response[field.id] === '');

    if (missingFields.length > 0) {
      throw new Error(`Required fields missing: ${missingFields.map(f => f.label).join(', ')}`);
    }

    // Update task with response
    const updateData: any = {
      status: 'SUBMITTED',
      employeeResponse: response,
      responseFiles: uploadedFiles,
      submittedAt: new Date(),
      updatedAt: new Date()
    };

    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(taskId) },
      { 
        $set: updateData,
        $push: {
          activities: {
            id: new Date().getTime().toString(),
            action: 'SUBMITTED',
            performedBy: userId,
            performedByRole: userRole,
            timestamp: new Date(),
            comment: 'Task submitted for review',
            metadata: {
              filesUploaded: uploadedFiles.length,
              fieldsCompleted: Object.keys(response).length
            }
          }
        }
      }
    );

    if (result.matchedCount === 0) {
      throw new Error('Failed to submit task');
    }

    // Return updated task
    const updatedTask = await tasksCollection.findOne({ _id: new ObjectId(taskId) }) as ITask;
    return updatedTask;
  }

  /**
   * Review and complete task (GM only)
   */
  async reviewAndCompleteTask(
    taskId: string, 
    reviewComment: string, 
    reviewerId: string, 
    reviewerRole: UserRole
  ): Promise<ITask> {
    const tasksCollection = await getCollection('tasks');
    
    const task = await tasksCollection.findOne({ _id: new ObjectId(taskId) }) as ITask;
    
    if (!task) {
      throw new Error('Task not found');
    }

    // Check if user can complete this task
    if (!hasPermission(reviewerRole, 'canAssignTasks')) {
      throw new Error('Only General Manager can complete tasks');
    }

    // Check if task is in a completable state
    if (task.status !== 'SUBMITTED') {
      throw new Error('Can only complete submitted tasks');
    }

    // Update task status to completed
    const updateData: any = {
      status: 'COMPLETED',
      completedAt: new Date(),
      updatedAt: new Date()
    };

    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(taskId) },
      { 
        $set: updateData,
        $push: {
          activities: {
            id: new Date().getTime().toString(),
            action: 'REVIEWED',
            performedBy: reviewerId,
            performedByRole: reviewerRole,
            timestamp: new Date(),
            comment: reviewComment
          }
        }
      }
    );

    if (result.matchedCount === 0) {
      throw new Error('Failed to review task');
    }

    // Add completed activity
    await this.addActivity(taskId, {
      action: 'COMPLETED',
      performedBy: reviewerId,
      performedByRole: reviewerRole,
      comment: 'Task marked as completed'
    });

    // Return updated task
    const updatedTask = await tasksCollection.findOne({ _id: new ObjectId(taskId) }) as ITask;
    return updatedTask;
  }

  /**
   * Update task status (for IN_PROGRESS, etc.)
   */
  async updateTaskStatus(
    taskId: string, 
    status: 'PENDING' | 'IN_PROGRESS' | 'CANCELLED',
    userId: string, 
    userRole: UserRole
  ): Promise<ITask> {
    const tasksCollection = await getCollection('tasks');
    
    const task = await tasksCollection.findOne({ _id: new ObjectId(taskId) }) as ITask;
    
    if (!task) {
      throw new Error('Task not found');
    }

    // Check permissions
    const canUpdate = 
      task.assignedTo === userId || 
      task.assignedBy === userId ||
      hasPermission(userRole, 'canAssignTasks');

    if (!canUpdate) {
      throw new Error('Insufficient permissions to update this task');
    }

    // Validate status transitions
    if (task.status === 'COMPLETED' && status !== 'CANCELLED') {
      throw new Error('Cannot modify a completed task');
    }
    
    if (task.status === 'SUBMITTED' && status !== 'CANCELLED') {
      throw new Error('Task is submitted and awaiting review');
    }

    // Update task status
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(taskId) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        },
        $push: {
          activities: {
            id: new Date().getTime().toString(),
            action: status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'CANCELLED',
            performedBy: userId,
            performedByRole: userRole,
            timestamp: new Date(),
            comment: `Status changed to ${status}`
          }
        }
      }
    );

    if (result.matchedCount === 0) {
      throw new Error('Failed to update task status');
    }

    // Return updated task
    const updatedTask = await tasksCollection.findOne({ _id: new ObjectId(taskId) }) as ITask;
    return updatedTask;
  }

  /**
   * Get task statistics for dashboard
   */
  async getTaskStatistics(userId: string, userRole: UserRole): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    submitted: number;
    completed: number;
    cancelled: number;
    overdue: number;
    myTasksOnly?: number;
  }> {
    const tasksCollection = await getCollection('tasks');
    
    let filter: any = {};
    
    // GM sees all tasks, others see only their tasks
    if (!hasPermission(userRole, 'canViewAllTasks')) {
      filter.assignedTo = userId;
    }

    const stats = {
      total: await tasksCollection.countDocuments(filter),
      pending: await tasksCollection.countDocuments({ ...filter, status: 'PENDING' }),
      inProgress: await tasksCollection.countDocuments({ ...filter, status: 'IN_PROGRESS' }),
      submitted: await tasksCollection.countDocuments({ ...filter, status: 'SUBMITTED' }),
      completed: await tasksCollection.countDocuments({ ...filter, status: 'COMPLETED' }),
      cancelled: await tasksCollection.countDocuments({ ...filter, status: 'CANCELLED' }),
      overdue: await tasksCollection.countDocuments({
        ...filter,
        status: { $in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { $lt: new Date() }
      })
    };

    // Add personal tasks count for non-GM users
    if (!hasPermission(userRole, 'canViewAllTasks')) {
      stats.myTasksOnly = stats.total;
    }

    return stats;
  }

  /**
   * Add activity to task
   */
  private async addActivity(taskId: string, activity: Omit<TaskActivity, 'id' | 'timestamp'>): Promise<void> {
    const tasksCollection = await getCollection('tasks');
    
    await tasksCollection.updateOne(
      { _id: new ObjectId(taskId) },
      {
        $push: {
          activities: {
            ...activity,
            id: new Date().getTime().toString(),
            timestamp: new Date()
          }
        }
      }
    );
  }

  /**
   * Get available users for task assignment (GM only)
   */
  async getAvailableUsers(requesterRole: UserRole): Promise<Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  }>> {
    if (!hasPermission(requesterRole, 'canAssignTasks')) {
      throw new Error('Insufficient permissions to view users for assignment');
    }

    const usersCollection = await getCollection('users');
    
    const users = await usersCollection
      .find({ isActive: true })
      .project({
        _id: 1,
        name: 1,
        email: 1,
        role: 1,
        department: 1
      })
      .toArray();

    return users.map(user => ({
      id: user._id?.toString() || '',
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    }));
  }
}
