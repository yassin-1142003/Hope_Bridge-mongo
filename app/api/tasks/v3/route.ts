/**
 * 🚀 ENHANCED TASKS API v3.0
 * 
 * Ultimate task management API with:
 * - Advanced filtering and search
 * - Real-time collaboration
 * - Smart notifications
 * - Performance optimization
 * - Comprehensive validation
 * - Activity tracking
 * - File attachments
 * - Comments and discussions
 * - Time tracking
 * - Dependencies management
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { UserRole, hasPermission } from "@/lib/roles";
import { 
  createEnhancedAPI, 
  APIUtils, 
  API_CONFIG 
} from "@/lib/apiEnhancements";
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

// 🎯 Enhanced Validation Schemas
const createTaskSchemaV3 = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(5000, "Description too long").optional(),
  assignedTo: z.array(z.string().email()).min(1, "At least one assignee is required"),
  priority: z.enum(['low', 'medium', 'high', 'urgent', 'critical']).default('medium'),
  status: z.enum(['draft', 'pending', 'in_progress', 'review', 'completed', 'cancelled', 'on_hold']).default('draft'),
  type: z.enum(['task', 'bug', 'feature', 'improvement', 'epic', 'story']).default('task'),
  
  // 📅 Dates
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  estimatedHours: z.number().min(0).max(1000).optional(),
  actualHours: z.number().min(0).max(1000).optional(),
  
  // 🏷️ Organization
  projectId: z.string().optional(),
  epicId: z.string().optional(),
  parentId: z.string().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  category: z.string().max(100).optional(),
  
  // 📊 Progress
  progress: z.number().min(0).max(100).default(0),
  completedSubtasks: z.number().min(0).default(0),
  totalSubtasks: z.number().min(0).default(0),
  
  // 🔔 Notifications
  notifyAssignees: z.boolean().default(true),
  notifyOnStatusChange: z.boolean().default(true),
  notifyOnDueDate: z.boolean().default(true),
  reminderDays: z.array(z.number().min(1).max(30)).default([1, 3, 7]),
  
  // 📎 Attachments
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    size: z.number(),
    type: z.string()
  })).optional(),
  
  // 🔗 Dependencies
  dependsOn: z.array(z.string()).optional(),
  blocks: z.array(z.string()).optional(),
  
  // 📝 Custom Fields
  customFields: z.record(z.any()).optional(),
  
  // 🎯 Sprint Planning
  sprintId: z.string().optional(),
  storyPoints: z.number().min(0).max(100).optional(),
  
  // 🏷️ Labels
  labels: z.array(z.string()).optional(),
  
  // 📊 Time Tracking
  timeEntries: z.array(z.object({
    userId: z.string(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    description: z.string(),
    hours: z.number(),
    billable: z.boolean()
  })).optional()
}).refine(data => {
  if (data.dueDate && data.startDate) {
    return new Date(data.dueDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: "Due date must be after start date"
}).refine(data => {
  if (data.parentId) {
    return data.parentId !== data.epicId;
  }
  return true;
}, {
  message: "Parent ID cannot be the same as Epic ID"
});

const updateTaskSchemaV3 = createTaskSchemaV3.partial();

const taskQuerySchemaV3 = z.object({
  // 📊 Basic Filters
  status: z.array(z.string()).optional(),
  priority: z.array(z.string()).optional(),
  type: z.array(z.string()).optional(),
  assignedTo: z.array(z.string().email()).optional(),
  createdBy: z.array(z.string().email()).optional(),
  projectId: z.array(z.string()).optional(),
  epicId: z.array(z.string()).optional(),
  sprintId: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  labels: z.array(z.string()).optional(),
  
  // 📅 Date Filters
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  dueAfter: z.string().datetime().optional(),
  dueBefore: z.string().datetime().optional(),
  completedAfter: z.string().datetime().optional(),
  completedBefore: z.string().datetime().optional(),
  
  // 🔍 Search
  search: z.string().max(500).optional(),
  searchIn: z.array(z.enum(['title', 'description', 'tags', 'customFields'])).default(['title', 'description']),
  
  // 📊 Progress Filters
  progressMin: z.number().min(0).max(100).optional(),
  progressMax: z.number().min(0).max(100).optional(),
  hasSubtasks: z.boolean().optional(),
  overdue: z.boolean().optional(),
  
  // 🎯 Hierarchy
  includeSubtasks: z.boolean().default(false),
  includeParent: z.boolean().default(false),
  maxDepth: z.number().min(1).max(10).optional(),
  
  // 📄 Sorting & Pagination
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'status', 'progress', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  
  // 📊 Includes
  includeComments: z.boolean().default(false),
  includeAttachments: z.boolean().default(true),
  includeTimeEntries: z.boolean().default(false),
  includeDependencies: z.boolean().default(false),
  includeActivity: z.boolean().default(false),
  
  // 📊 Analytics
  includeAnalytics: z.boolean().default(false),
  groupBy: z.enum(['status', 'priority', 'type', 'assignedTo', 'project']).optional(),
  aggregateBy: z.enum(['count', 'sum', 'avg']).optional()
});

// 🚀 Enhanced Task Manager
class EnhancedTaskManager {
  // 📝 Create Task
  async createTaskV3(taskData: any, session: any, enhancers: any): Promise<any> {
    const tasksCollection = await getCollection('tasks');
    const activityCollection = await getCollection('activity_logs');
    const notificationsCollection = await getCollection('notifications');
    
    // 🎯 Generate Task ID
    const taskId = new ObjectId();
    const taskNumber = await this.generateTaskNumber(taskData.projectId);
    
    // 🔗 Validate Dependencies
    if (taskData.dependsOn && taskData.dependsOn.length > 0) {
      await this.validateDependencies(taskData.dependsOn, session);
    }
    
    // 📊 Create Task Record
    const task = {
      _id: taskId,
      taskNumber,
      ...taskData,
      
      // 📊 Metadata
      createdBy: session.user.email,
      createdByName: session.user.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // 📊 Status Tracking
      statusHistory: [{
        status: taskData.status,
        changedBy: session.user.email,
        changedAt: new Date(),
        comment: 'Task created'
      }],
      
      // 📊 Activity Tracking
      lastActivityAt: new Date(),
      activityCount: 0,
      
      // 📊 Analytics
      analytics: {
        views: 0,
        comments: 0,
        attachments: 0,
        timeSpent: 0,
        lastViewed: null,
        averageTimeToComplete: null
      },
      
      // 📊 Collaboration
      watchers: [session.user.email, ...taskData.assignedTo],
      collaborators: taskData.assignedTo,
      
      // 📊 Version Control
      version: 1,
      
      // 📊 Status
      isDeleted: false,
      isArchived: false,
      locked: false,
      
      // 📊 Time Tracking
      timeTracking: {
        estimatedHours: taskData.estimatedHours || 0,
        actualHours: taskData.actualHours || 0,
        entries: taskData.timeEntries || []
      }
    };
    
    // 💾 Save Task
    await tasksCollection.insertOne(task);
    
    // 📊 Update Parent Task
    if (taskData.parentId) {
      await this.updateParentTaskCounts(taskData.parentId);
    }
    
    // 📊 Update Epic
    if (taskData.epicId) {
      await this.updateEpicCounts(taskData.epicId);
    }
    
    // 📊 Update Project
    if (taskData.projectId) {
      await this.updateProjectCounts(taskData.projectId);
    }
    
    // 📊 Log Activity
    await this.logActivity({
      type: 'task_created',
      taskId: taskId.toString(),
      taskNumber,
      userId: session.user.email,
      details: {
        title: taskData.title,
        priority: taskData.priority,
        assignedTo: taskData.assignedTo,
        projectId: taskData.projectId
      }
    });
    
    // 📊 Send Notifications
    if (taskData.notifyAssignees) {
      await this.sendTaskNotifications({
        type: 'task_assigned',
        taskId: taskId.toString(),
        taskNumber,
        recipients: taskData.assignedTo,
        data: {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          assignedBy: session.user.name
        }
      });
    }
    
    // 📊 Cache Invalidation
    await enhancers.cacheManager.clear(`tasks:*`);
    
    return task;
  }
  
  // 📋 Get Tasks
  async getTasksV3(query: any, session: any, enhancers: any): Promise<any> {
    const tasksCollection = await getCollection('tasks');
    
    // 🎯 Build Query
    const dbQuery = await this.buildTaskQuery(query, session);
    
    // 📊 Get Total Count
    const total = await tasksCollection.countDocuments(dbQuery);
    
    // 📊 Build Aggregation Pipeline
    const pipeline: any[] = [
      { $match: dbQuery },
      { $sort: { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 } }
    ];
    
    // 📊 Include Relations
    if (query.includeSubtasks) {
      pipeline.push({
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: 'parentId',
          as: 'subtasks',
          pipeline: [
            { $project: { _id: 1, title: 1, status: 1, priority: 1, progress: 1 } }
          ]
        }
      });
    }
    
    if (query.includeParent) {
      pipeline.push({
        $lookup: {
          from: 'tasks',
          localField: 'parentId',
          foreignField: '_id',
          as: 'parent',
          pipeline: [
            { $project: { _id: 1, title: 1, status: 1 } }
          ]
        }
      });
    }
    
    if (query.includeComments) {
      pipeline.push({
        $lookup: {
          from: 'task_comments',
          localField: '_id',
          foreignField: 'taskId',
          as: 'comments',
          pipeline: [
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            { $project: { content: 1, author: 1, createdAt: 1 } }
          ]
        }
      });
    }
    
    if (query.includeAttachments) {
      pipeline.push({
        $lookup: {
          from: 'files',
          localField: 'attachments.id',
          foreignField: '_id',
          as: 'attachmentDetails',
          pipeline: [
            { $project: { name: 1, url: 1, size: 1, type: 1 } }
          ]
        }
      });
    }
    
    if (query.includeDependencies) {
      pipeline.push(
        {
          $lookup: {
            from: 'tasks',
            localField: 'dependsOn',
            foreignField: '_id',
            as: 'dependencies',
            pipeline: [
              { $project: { _id: 1, title: 1, status: 1, priority: 1 } }
            ]
          }
        },
        {
          $lookup: {
            from: 'tasks',
            localField: 'blocks',
            foreignField: '_id',
            as: 'blockedTasks',
            pipeline: [
              { $project: { _id: 1, title: 1, status: 1, priority: 1 } }
            ]
          }
        }
      );
    }
    
    // 📊 Pagination
    pipeline.push(
      { $skip: (query.page - 1) * query.limit },
      { $limit: query.limit }
    );
    
    // 📊 Execute Query
    const tasks = await tasksCollection.aggregate(pipeline).toArray();
    
    // 📊 Calculate Analytics
    let analytics = null;
    if (query.includeAnalytics) {
      analytics = await this.calculateTasksAnalytics(dbQuery, query.groupBy, query.aggregateBy);
    }
    
    // 📊 Pagination
    const pagination = APIUtils.createPagination(query.page, query.limit, total);
    
    return {
      tasks,
      pagination,
      analytics,
      filters: {
        status: query.status,
        priority: query.priority,
        assignedTo: query.assignedTo,
        projectId: query.projectId,
        search: query.search
      },
      meta: {
        total,
        executionTime: Date.now(),
        cacheHit: false
      }
    };
  }
  
  // 📝 Update Task
  async updateTaskV3(taskId: string, updateData: any, session: any, enhancers: any): Promise<any> {
    const tasksCollection = await getCollection('tasks');
    
    // 🎯 Validate Task Exists
    const existingTask = await tasksCollection.findOne({ 
      _id: new ObjectId(taskId),
      isDeleted: false 
    });
    
    if (!existingTask) {
      throw new Error('Task not found');
    }
    
    // 🎯 Check Permissions
    if (!this.canEditTask(existingTask, session)) {
      throw new Error('Insufficient permissions to edit this task');
    }
    
    // 🔗 Validate Dependencies
    if (updateData.dependsOn) {
      await this.validateDependencies(updateData.dependsOn, session);
    }
    
    // 📊 Build Update Data
    const updateFields = {
      ...updateData,
      updatedAt: new Date(),
      updatedBy: session.user.email,
      version: existingTask.version + 1
    };
    
    // 📊 Track Status Changes
    if (updateData.status && updateData.status !== existingTask.status) {
      updateFields.statusHistory = [
        ...(existingTask.statusHistory || []),
        {
          status: updateData.status,
          changedBy: session.user.email,
          changedAt: new Date(),
          comment: updateData.statusComment || `Status changed to ${updateData.status}`
        }
      ];
      
      // 📊 Mark as completed if status is completed
      if (updateData.status === 'completed') {
        updateFields.completedAt = new Date();
        updateFields.completedBy = session.user.email;
      }
    }
    
    // 📊 Update Task
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      throw new Error('Failed to update task');
    }
    
    // 📊 Get Updated Task
    const updatedTask = await tasksCollection.findOne({ _id: new ObjectId(taskId) });
    
    // 📊 Log Activity
    await this.logActivity({
      type: 'task_updated',
      taskId,
      userId: session.user.email,
      details: {
        changes: this.getTaskChanges(existingTask, updateData),
        previousStatus: existingTask.status,
        newStatus: updateData.status
      }
    });
    
    // 📊 Send Notifications
    if (updateData.status && updateData.status !== existingTask.status) {
      await this.sendTaskNotifications({
        type: 'status_changed',
        taskId,
        recipients: [...new Set([existingTask.createdBy, ...existingTask.assignedTo, ...updateData.assignedTo || []])],
        data: {
          title: existingTask.title,
          previousStatus: existingTask.status,
          newStatus: updateData.status,
          changedBy: session.user.name
        }
      });
    }
    
    // 📊 Cache Invalidation
    await enhancers.cacheManager.clear(`tasks:*`);
    
    return updatedTask;
  }
  
  // 🗑️ Delete Task
  async deleteTaskV3(taskId: string, session: any, enhancers: any): Promise<void> {
    const tasksCollection = await getCollection('tasks');
    
    // 🎯 Validate Task Exists
    const existingTask = await tasksCollection.findOne({ 
      _id: new ObjectId(taskId),
      isDeleted: false 
    });
    
    if (!existingTask) {
      throw new Error('Task not found');
    }
    
    // 🎯 Check Permissions
    if (!this.canDeleteTask(existingTask, session)) {
      throw new Error('Insufficient permissions to delete this task');
    }
    
    // 📊 Check Dependencies
    const dependentTasks = await tasksCollection.find({
      dependsOn: taskId,
      isDeleted: false
    }).toArray();
    
    if (dependentTasks.length > 0) {
      throw new Error('Cannot delete task with dependent tasks');
    }
    
    // 📊 Soft Delete
    await tasksCollection.updateOne(
      { _id: new ObjectId(taskId) },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: session.user.email
        }
      }
    );
    
    // 📊 Update Parent Task
    if (existingTask.parentId) {
      await this.updateParentTaskCounts(existingTask.parentId);
    }
    
    // 📊 Log Activity
    await this.logActivity({
      type: 'task_deleted',
      taskId,
      userId: session.user.email,
      details: {
        title: existingTask.title,
        reason: 'Task deleted by user'
      }
    });
    
    // 📊 Cache Invalidation
    await enhancers.cacheManager.clear(`tasks:*`);
  }
  
  // 🔧 Helper Methods
  private async generateTaskNumber(projectId?: string): Promise<string> {
    const tasksCollection = await getCollection('tasks');
    const filter = projectId ? { projectId } : {};
    
    const count = await tasksCollection.countDocuments(filter);
    const prefix = projectId ? `PROJ-${projectId}-` : 'TASK-';
    
    return `${prefix}${count + 1}`;
  }
  
  private async validateDependencies(dependencyIds: string[], session: any): Promise<void> {
    const tasksCollection = await getCollection('tasks');
    
    const dependencies = await tasksCollection.find({
      _id: { $in: dependencyIds.map(id => new ObjectId(id)) },
      isDeleted: false
    }).toArray();
    
    if (dependencies.length !== dependencyIds.length) {
      throw new Error('One or more dependencies not found');
    }
    
    // Check for circular dependencies
    for (const dep of dependencies) {
      if (dep.dependsOn && dep.dependsOn.some((id: string) => dependencyIds.includes(id))) {
        throw new Error('Circular dependency detected');
      }
    }
  }
  
  private async buildTaskQuery(query: any, session: any): Promise<any> {
    const dbQuery: any = {
      isDeleted: false,
      $or: [
        { createdBy: session.user.email },
        { assignedTo: session.user.email },
        { watchers: session.user.email },
        { collaborators: session.user.email }
      ]
    };
    
    // 📊 Basic Filters
    if (query.status && query.status.length > 0) {
      dbQuery.status = { $in: query.status };
    }
    
    if (query.priority && query.priority.length > 0) {
      dbQuery.priority = { $in: query.priority };
    }
    
    if (query.type && query.type.length > 0) {
      dbQuery.type = { $in: query.type };
    }
    
    if (query.assignedTo && query.assignedTo.length > 0) {
      dbQuery.assignedTo = { $in: query.assignedTo };
    }
    
    if (query.createdBy && query.createdBy.length > 0) {
      dbQuery.createdBy = { $in: query.createdBy };
    }
    
    if (query.projectId && query.projectId.length > 0) {
      dbQuery.projectId = { $in: query.projectId };
    }
    
    if (query.epicId && query.epicId.length > 0) {
      dbQuery.epicId = { $in: query.epicId };
    }
    
    if (query.sprintId && query.sprintId.length > 0) {
      dbQuery.sprintId = { $in: query.sprintId };
    }
    
    if (query.tags && query.tags.length > 0) {
      dbQuery.tags = { $in: query.tags };
    }
    
    if (query.category) {
      dbQuery.category = query.category;
    }
    
    if (query.labels && query.labels.length > 0) {
      dbQuery.labels = { $in: query.labels };
    }
    
    // 📅 Date Filters
    if (query.createdAfter || query.createdBefore) {
      dbQuery.createdAt = {};
      if (query.createdAfter) dbQuery.createdAt.$gte = new Date(query.createdAfter);
      if (query.createdBefore) dbQuery.createdAt.$lte = new Date(query.createdBefore);
    }
    
    if (query.dueAfter || query.dueBefore) {
      dbQuery.dueDate = {};
      if (query.dueAfter) dbQuery.dueDate.$gte = new Date(query.dueAfter);
      if (query.dueBefore) dbQuery.dueDate.$lte = new Date(query.dueBefore);
    }
    
    if (query.completedAfter || query.completedBefore) {
      dbQuery.completedAt = {};
      if (query.completedAfter) dbQuery.completedAt.$gte = new Date(query.completedAfter);
      if (query.completedBefore) dbQuery.completedAt.$lte = new Date(query.completedBefore);
    }
    
    // 📊 Progress Filters
    if (query.progressMin !== undefined || query.progressMax !== undefined) {
      dbQuery.progress = {};
      if (query.progressMin !== undefined) dbQuery.progress.$gte = query.progressMin;
      if (query.progressMax !== undefined) dbQuery.progress.$lte = query.progressMax;
    }
    
    if (query.hasSubtasks !== undefined) {
      dbQuery.totalSubtasks = query.hasSubtasks ? { $gt: 0 } : { $eq: 0 };
    }
    
    if (query.overdue !== undefined) {
      const now = new Date();
      if (query.overdue) {
        dbQuery.dueDate = { $lt: now, $exists: true };
        dbQuery.status = { $nin: ['completed', 'cancelled'] };
      } else {
        dbQuery.$or = [
          { dueDate: { $gte: now } },
          { dueDate: { $exists: false } },
          { status: { $in: ['completed', 'cancelled'] } }
        ];
      }
    }
    
    // 🔍 Search
    if (query.search) {
      const searchConditions = query.searchIn.map((field: string) => {
        if (field === 'customFields') {
          return { 'customFields': { $regex: query.search, $options: 'i' } };
        }
        return { [field]: { $regex: query.search, $options: 'i' } };
      });
      
      dbQuery.$and = (dbQuery.$and || []).concat({
        $or: searchConditions
      });
    }
    
    return dbQuery;
  }
  
  private canEditTask(task: any, session: any): boolean {
    return (
      task.createdBy === session.user.email ||
      task.assignedTo.includes(session.user.email) ||
      hasPermission(session.user.role, 'edit_all_tasks')
    );
  }
  
  private canDeleteTask(task: any, session: any): boolean {
    return (
      task.createdBy === session.user.email ||
      hasPermission(session.user.role, 'delete_all_tasks')
    );
  }
  
  private async logActivity(activity: any): Promise<void> {
    const activityCollection = await getCollection('activity_logs');
    await activityCollection.insertOne({
      ...activity,
      timestamp: new Date(),
      id: new ObjectId().toString()
    });
  }
  
  private async sendTaskNotifications(notification: any): Promise<void> {
    const notificationsCollection = await getCollection('notifications');
    
    const notifications = notification.recipients.map((recipient: string) => ({
      _id: new ObjectId(),
      type: notification.type,
      recipient,
      data: notification.data,
      read: false,
      createdAt: new Date()
    }));
    
    await notificationsCollection.insertMany(notifications);
  }
  
  private getTaskChanges(oldTask: any, newTask: any): any {
    const changes: any = {};
    
    for (const [key, value] of Object.entries(newTask)) {
      if (oldTask[key] !== value) {
        changes[key] = {
          from: oldTask[key],
          to: value
        };
      }
    }
    
    return changes;
  }
  
  private async calculateTasksAnalytics(query: any, groupBy?: string, aggregateBy?: string): Promise<any> {
    const tasksCollection = await getCollection('tasks');
    
    if (!groupBy) {
      const stats = await tasksCollection.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            averageProgress: { $avg: '$progress' },
            totalEstimatedHours: { $sum: '$estimatedHours' },
            totalActualHours: { $sum: '$actualHours' }
          }
        }
      ]).toArray();
      
      return stats[0] || {};
    }
    
    // Grouped analytics
    const groupPipeline = [
      { $match: query },
      {
        $group: {
          _id: `$${groupBy}`,
          count: aggregateBy === 'sum' ? { $sum: 1 } : 
                 aggregateBy === 'avg' ? { $avg: '$progress' } : 
                 { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ];
    
    return await tasksCollection.aggregate(groupPipeline).toArray();
  }
  
  private async updateParentTaskCounts(parentId: string): Promise<void> {
    const tasksCollection = await getCollection('tasks');
    
    const subtaskCount = await tasksCollection.countDocuments({
      parentId,
      isDeleted: false
    });
    
    const completedSubtasks = await tasksCollection.countDocuments({
      parentId,
      status: 'completed',
      isDeleted: false
    });
    
    await tasksCollection.updateOne(
      { _id: new ObjectId(parentId) },
      {
        $set: {
          totalSubtasks: subtaskCount,
          completedSubtasks,
          progress: subtaskCount > 0 ? (completedSubtasks / subtaskCount) * 100 : 0,
          updatedAt: new Date()
        }
      }
    );
  }
  
  private async updateEpicCounts(epicId: string): Promise<void> {
    const tasksCollection = await getCollection('tasks');
    
    const epicTaskCount = await tasksCollection.countDocuments({
      epicId,
      isDeleted: false
    });
    
    const completedEpicTasks = await tasksCollection.countDocuments({
      epicId,
      status: 'completed',
      isDeleted: false
    });
    
    await tasksCollection.updateOne(
      { _id: new ObjectId(epicId) },
      {
        $set: {
          totalSubtasks: epicTaskCount,
          completedSubtasks: completedEpicTasks,
          progress: epicTaskCount > 0 ? (completedEpicTasks / epicTaskCount) * 100 : 0,
          updatedAt: new Date()
        }
      }
    );
  }
  
  private async updateProjectCounts(projectId: string): Promise<void> {
    const tasksCollection = await getCollection('tasks');
    const projectsCollection = await getCollection('projects');
    
    const projectTaskCount = await tasksCollection.countDocuments({
      projectId,
      isDeleted: false
    });
    
    const completedProjectTasks = await tasksCollection.countDocuments({
      projectId,
      status: 'completed',
      isDeleted: false
    });
    
    await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      {
        $set: {
          totalTasks: projectTaskCount,
          completedTasks: completedProjectTasks,
          progress: projectTaskCount > 0 ? (completedProjectTasks / projectTaskCount) * 100 : 0,
          updatedAt: new Date()
        }
      }
    );
  }
}

// 🚀 API Handlers
const enhancedTaskManager = new EnhancedTaskManager();

// 📋 GET - Enhanced Tasks
export const GET = createEnhancedAPI(
  async (request: NextRequest, context: any, enhancers) => {
    const { searchParams } = new URL(request.url);
    const query = taskQuerySchemaV3.parse(Object.fromEntries(searchParams));
    
    const result = await enhancedTaskManager.getTasksV3(query, enhancers.session, enhancers);
    
    return NextResponse.json(
      createSuccessResponse(
        result,
        "Tasks retrieved successfully",
        {
          query,
          pagination: result.pagination,
          version: 'v3.0'
        }
      )
    );
  },
  {
    requireAuth: true,
    rateLimitTier: 'default',
    cacheKey: (request) => `tasks:${request.url}`,
    cacheTTL: API_CONFIG.CACHE.user.ttl,
    enableMetrics: true
  }
);

// 📝 POST - Create Enhanced Task
export const POST = createEnhancedAPI(
  async (request: NextRequest, context: any, enhancers) => {
    const taskData = createTaskSchemaV3.parse(enhancers.validatedInput);
    
    const task = await enhancedTaskManager.createTaskV3(taskData, enhancers.session, enhancers);
    
    return NextResponse.json(
      createCreatedResponse(
        task,
        "Task created successfully",
        {
          taskId: task._id.toString(),
          taskNumber: task.taskNumber,
          version: 'v3.0'
        }
      ),
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    rateLimitTier: 'default',
    validateInput: createTaskSchemaV3,
    enableMetrics: true
  }
);

// 📝 PUT - Update Enhanced Task
export const PUT = createEnhancedAPI(
  async (request: NextRequest, context: any, enhancers) => {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      return NextResponse.json(
        createBadRequestResponse("Task ID is required"),
        { status: 400 }
      );
    }
    
    const updateData = updateTaskSchemaV3.parse(enhancers.validatedInput);
    
    const task = await enhancedTaskManager.updateTaskV3(taskId, updateData, enhancers.session, enhancers);
    
    return NextResponse.json(
      createSuccessResponse(
        task,
        "Task updated successfully",
        {
          taskId: task._id.toString(),
          version: task.version,
          version: 'v3.0'
        }
      )
    );
  },
  {
    requireAuth: true,
    rateLimitTier: 'default',
    validateInput: updateTaskSchemaV3,
    enableMetrics: true
  }
);

// 🗑️ DELETE - Delete Enhanced Task
export const DELETE = createEnhancedAPI(
  async (request: NextRequest, context: any, enhancers) => {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      return NextResponse.json(
        createBadRequestResponse("Task ID is required"),
        { status: 400 }
      );
    }
    
    await enhancedTaskManager.deleteTaskV3(taskId, enhancers.session, enhancers);
    
    return NextResponse.json(
      createSuccessResponse(
        null,
        "Task deleted successfully",
        {
          taskId,
          version: 'v3.0'
        }
      )
    );
  },
  {
    requireAuth: true,
    rateLimitTier: 'default',
    enableMetrics: true
  }
);
