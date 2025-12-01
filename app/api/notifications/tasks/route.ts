/**
 * Task Notifications API Route
 * 
 * Professional API for fetching and managing task-related notifications
 * with real-time updates, filtering, and pagination support.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

// Query schema for validation
const querySchema = z.object({
  limit: z.string().transform(Number).default('20'),
  offset: z.string().transform(Number).default('0'),
  includeRead: z.string().transform(val => val === 'true').default('false'),
  actionRequired: z.string().transform(val => val === 'true').default('false'),
  lastFetch: z.string().optional(),
  userId: z.string().optional(),
  type: z.enum(['new_task_assigned', 'task_updated', 'task_completed', 'task_overdue', 'task_cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional()
});

// Response schema
const alertSchema = z.object({
  id: z.string(),
  type: z.enum(['new_task_assigned', 'task_updated', 'task_completed', 'task_overdue', 'task_cancelled']),
  title: z.string(),
  message: z.string(),
  taskId: z.string().optional(),
  taskTitle: z.string(),
  assignedTo: z.string(),
  assignedToName: z.string(),
  assignedBy: z.string(),
  assignedByName: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string(),
  createdAt: z.string(),
  read: z.boolean(),
  actionRequired: z.boolean(),
  metadata: z.record(z.any()).optional()
});

const responseSchema = z.object({
  success: z.boolean(),
  alerts: z.array(alertSchema),
  unreadCount: z.number(),
  totalCount: z.number(),
  hasMore: z.boolean(),
  lastFetchTime: z.string()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));
    
    const notificationsCollection = await getCollection('notifications');
    const usersCollection = await getCollection('users');
    const tasksCollection = await getCollection('tasks');
    
    // Build query filter
    const filter: any = {
      type: { $in: ['new_task_assigned', 'task_updated', 'task_completed', 'task_overdue', 'task_cancelled'] }
    };
    
    // Add time-based filter for incremental updates
    if (query.lastFetch) {
      filter.createdAt = { $gt: new Date(query.lastFetch) };
    }
    
    // Add read status filter
    if (!query.includeRead) {
      filter.read = false;
    }
    
    // Add action required filter
    if (query.actionRequired) {
      filter.actionRequired = true;
    }
    
    // Add user-specific filter (if userId provided)
    if (query.userId) {
      filter.$or = [
        { assignedTo: query.userId },
        { createdBy: query.userId }
      ];
    }
    
    // Add type filter
    if (query.type) {
      filter.type = query.type;
    }
    
    // Add priority filter
    if (query.priority) {
      filter['metadata.priority'] = query.priority;
    }
    
    // Fetch notifications with pagination
    const notifications = await notificationsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(query.limit)
      .skip(query.offset)
      .toArray();
    
    // Get user information for names
    const userIds = new Set<string>();
    notifications.forEach(notif => {
      if (notif.assignedTo) userIds.add(notif.assignedTo);
      if (notif.assignedBy) userIds.add(notif.assignedBy);
      if (notif.createdBy) userIds.add(notif.createdBy);
    });
    
    const users = await usersCollection
      .find({ email: { $in: Array.from(userIds) } })
      .toArray();
    
    const userMap = new Map(users.map(user => [user.email, user.name || user.email]));
    
    // Get task information
    const taskIds = notifications
      .filter(notif => notif.taskId)
      .map(notif => notif.taskId);
    
    const tasks = taskIds.length > 0 ? await tasksCollection
      .find({ _id: { $in: taskIds.map(id => new ObjectId(id)) } })
      .toArray() : [];
    
    const taskMap = new Map(tasks.map(task => [task._id.toString(), task]));
    
    // Transform notifications to alert format
    const alerts = notifications.map(notif => {
      const task = taskMap.get(notif.taskId);
      
      return {
        id: notif._id.toString(),
        type: notif.type,
        title: notif.title || generateAlertTitle(notif.type, task),
        message: notif.message || generateAlertMessage(notif.type, task, userMap),
        taskId: notif.taskId,
        taskTitle: task?.title || 'Unknown Task',
        assignedTo: notif.assignedTo || '',
        assignedToName: userMap.get(notif.assignedTo || '') || notif.assignedTo || 'Unknown',
        assignedBy: notif.assignedBy || notif.createdBy || '',
        assignedByName: userMap.get(notif.assignedBy || notif.createdBy || '') || 'Unknown',
        priority: notif.metadata?.priority || task?.priority || 'medium',
        dueDate: task?.endDate || notif.metadata?.dueDate || '',
        createdAt: notif.createdAt.toISOString(),
        read: notif.read || false,
        actionRequired: notif.actionRequired || false,
        metadata: notif.metadata || {}
      };
    });
    
    // Get counts
    const unreadCount = await notificationsCollection.countDocuments({
      ...filter,
      read: false
    });
    
    const totalCount = await notificationsCollection.countDocuments(filter);
    const hasMore = query.offset + query.limit < totalCount;
    
    const response = {
      success: true,
      alerts,
      unreadCount,
      totalCount,
      hasMore,
      lastFetchTime: new Date().toISOString()
    };
    
    // Validate response
    const validatedResponse = responseSchema.parse(response);
    
    return NextResponse.json(validatedResponse, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Error fetching task notifications:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions
function generateAlertTitle(type: string, task: any): string {
  switch (type) {
    case 'new_task_assigned':
      return 'New Task Assigned';
    case 'task_updated':
      return 'Task Updated';
    case 'task_completed':
      return 'Task Completed';
    case 'task_overdue':
      return 'Task Overdue';
    case 'task_cancelled':
      return 'Task Cancelled';
    default:
      return 'Task Notification';
  }
}

function generateAlertMessage(type: string, task: any, userMap: Map<string, string>): string {
  const taskTitle = task?.title || 'a task';
  const assignedByName = userMap.get(task?.assignedBy || '') || 'Someone';
  
  switch (type) {
    case 'new_task_assigned':
      return `${assignedByName} assigned "${taskTitle}" to you`;
    case 'task_updated':
      return `"${taskTitle}" has been updated`;
    case 'task_completed':
      return `"${taskTitle}" has been completed`;
    case 'task_overdue':
      return `"${taskTitle}" is overdue and needs attention`;
    case 'task_cancelled':
      return `"${taskTitle}" has been cancelled`;
    default:
      return `Update regarding "${taskTitle}"`;
  }
}

// PATCH endpoint for marking notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertIds, markAll } = body;
    
    const notificationsCollection = await getCollection('notifications');
    
    if (markAll) {
      // Mark all notifications as read for the user
      await notificationsCollection.updateMany(
        { 
          type: { $in: ['new_task_assigned', 'task_updated', 'task_completed', 'task_overdue', 'task_cancelled'] },
          read: false
        },
        { $set: { read: true, updatedAt: new Date() } }
      );
    } else if (alertIds && Array.isArray(alertIds)) {
      // Mark specific notifications as read
      await notificationsCollection.updateMany(
        { 
          _id: { $in: alertIds.map(id => new ObjectId(id)) }
        },
        { $set: { read: true, updatedAt: new Date() } }
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint for removing notifications
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');
    
    if (!alertId) {
      return NextResponse.json(
        { success: false, error: 'Alert ID is required' },
        { status: 400 }
      );
    }
    
    const notificationsCollection = await getCollection('notifications');
    
    const result = await notificationsCollection.deleteOne({
      _id: new ObjectId(alertId)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
