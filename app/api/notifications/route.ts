// app/api/notifications/route.ts - Professional Notifications API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';
import { 
  createSuccessResponse, 
  createBadRequestResponse, 
  createUnauthorizedResponse, 
  createNotFoundResponse, 
  handleApiError, 
  setCorsHeaders 
} from '@/lib/apiResponse';
import { z } from 'zod';

// Validation schemas
const createNotificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  message: z.string().min(1, "Message is required").max(500, "Message too long"),
  type: z.enum(['info', 'success', 'warning', 'error', 'task_assigned', 'task_completed', 'task_overdue']),
  userId: z.string().email("Invalid user email"),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  actionUrl: z.string().url().optional(),
  actionText: z.string().max(50).optional(),
  metadata: z.record(z.any()).optional()
});

const updateNotificationSchema = z.object({
  read: z.boolean().optional(),
  archived: z.boolean().optional()
});

// Enhanced notification manager with database persistence
class ProfessionalNotificationManager {
  async addNotification(data: any, session: any): Promise<any> {
    try {
      const notificationsCollection = await getCollection('notifications');
      
      const notification = {
        _id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        read: false,
        archived: false,
        createdBy: session?.user?.email || 'system',
        expiresAt: data.priority === 'urgent' 
          ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours for urgent
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days for others
      };
      
      await notificationsCollection.insertOne(notification);
      
      // Log activity
      await this.logActivity({
        userId: data.userId,
        action: 'CREATE',
        entityType: 'notification',
        entityId: notification._id,
        entityName: data.title,
        description: `Notification sent: ${data.title}`,
        metadata: {
          type: data.type,
          priority: data.priority,
          ipAddress: session?.user?.ipAddress,
          userAgent: session?.user?.userAgent
        }
      });
      
      return notification;
    } catch (error) {
      console.error('Failed to add notification:', error);
      throw error;
    }
  }
  
  async getUserNotifications(userId: string, options: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
    type?: string;
  } = {}): Promise<{ notifications: any[]; total: number; unreadCount: number }> {
    try {
      const notificationsCollection = await getCollection('notifications');
      
      // Build query
      const query: any = {
        userId,
        archived: { $ne: true },
        $or: [
          { expiresAt: { $gt: new Date() } },
          { expiresAt: { $exists: false } }
        ]
      };
      
      if (options.unreadOnly) {
        query.read = false;
      }
      
      if (options.type) {
        query.type = options.type;
      }
      
      // Get total count and unread count
      const [total, unreadCount] = await Promise.all([
        notificationsCollection.countDocuments(query),
        notificationsCollection.countDocuments({ ...query, read: false })
      ]);
      
      // Get notifications with pagination
      const notifications = await notificationsCollection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(options.offset || 0)
        .limit(options.limit || 50)
        .toArray();
      
      return {
        notifications: notifications.map(notif => ({
          id: notif._id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          timestamp: notif.createdAt,
          read: notif.read,
          userId: notif.userId,
          actionUrl: notif.actionUrl,
          actionText: notif.actionText,
          metadata: notif.metadata,
          priority: notif.priority
        })),
        total,
        unreadCount
      };
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      throw error;
    }
  }
  
  async updateNotification(notificationId: string, updates: any, session: any): Promise<any> {
    try {
      const notificationsCollection = await getCollection('notifications');
      
      const result = await notificationsCollection.updateOne(
        { _id: notificationId },
        { 
          $set: { 
            ...updates, 
            updatedAt: new Date(),
            updatedBy: session?.user?.email
          } 
        }
      );
      
      if (result.matchedCount === 0) {
        throw new Error('Notification not found');
      }
      
      // Log activity
      await this.logActivity({
        userId: session?.user?.email || 'unknown',
        action: 'UPDATE',
        entityType: 'notification',
        entityId: notificationId,
        entityName: 'Notification',
        description: `Notification updated: ${JSON.stringify(updates)}`,
        metadata: updates
      });
      
      return result;
    } catch (error) {
      console.error('Failed to update notification:', error);
      throw error;
    }
  }
  
  async markAllAsRead(userId: string, session: any): Promise<any> {
    try {
      const notificationsCollection = await getCollection('notifications');
      
      const result = await notificationsCollection.updateMany(
        { userId, read: false, archived: { $ne: true } },
        { $set: { read: true, updatedAt: new Date(), updatedBy: session?.user?.email } }
      );
      
      // Log activity
      await this.logActivity({
        userId,
        action: 'BULK_UPDATE',
        entityType: 'notification',
        entityId: 'bulk',
        entityName: 'Mark all as read',
        description: `All notifications marked as read for user: ${userId}`,
        metadata: { count: result.modifiedCount }
      });
      
      return result;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }
  
  private async logActivity(activity: any) {
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

// Initialize notification manager
const notificationManager = new ProfessionalNotificationManager();

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

// GET - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');

    const result = await notificationManager.getUserNotifications(session.user.email, {
      unreadOnly,
      limit,
      offset,
      type
    });

    const response = createSuccessResponse(
      result.notifications,
      `Successfully retrieved ${result.notifications.length} notifications`,
      {
        total: result.total,
        unreadCount: result.unreadCount,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < result.total
        }
      }
    );

    return setCorsHeaders(response);
  } catch (error) {
    return handleApiError(error, "Fetching notifications");
  }
}

// POST - Create new notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = createNotificationSchema.parse(body);

    // Add client request info
    const notificationData = {
      ...validatedData,
      metadata: {
        ...validatedData.metadata,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    };

    const notification = await notificationManager.addNotification(notificationData, session);

    const response = createSuccessResponse(
      notification,
      "Notification created successfully",
      {
        type: notification.type,
        priority: notification.priority,
        userId: notification.userId
      }
    );

    return setCorsHeaders(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return setCorsHeaders(createBadRequestResponse(
        error.errors.map(e => e.message).join(', ')
      ));
    }
    return handleApiError(error, "Creating notification");
  }
}

// PATCH - Update notification (mark as read, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }

    const body = await request.json();
    const { notificationId, markAllAsRead, ...updates } = body;

    if (markAllAsRead) {
      const result = await notificationManager.markAllAsRead(session.user.email, session);
      
      const response = createSuccessResponse(
        { modifiedCount: result.modifiedCount },
        `Marked ${result.modifiedCount} notifications as read`
      );
      
      return setCorsHeaders(response);
    }

    if (!notificationId) {
      return setCorsHeaders(createBadRequestResponse("Notification ID is required"));
    }

    // Validate updates
    const validatedUpdates = updateNotificationSchema.parse(updates);

    const result = await notificationManager.updateNotification(notificationId, validatedUpdates, session);

    const response = createSuccessResponse(
      result,
      "Notification updated successfully"
    );

    return setCorsHeaders(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return setCorsHeaders(createBadRequestResponse(
        error.errors.map(e => e.message).join(', ')
      ));
    }
    return handleApiError(error, "Updating notification");
  }
}

// DELETE - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return setCorsHeaders(createBadRequestResponse("Notification ID is required"));
    }

    const notificationsCollection = await getCollection('notifications');
    
    const result = await notificationsCollection.updateOne(
      { _id: notificationId, userId: session.user.email },
      { $set: { archived: true, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return setCorsHeaders(createNotFoundResponse("Notification not found"));
    }

    // Log activity
    await notificationManager.logActivity({
      userId: session.user.email,
      action: 'DELETE',
      entityType: 'notification',
      entityId: notificationId,
      entityName: 'Notification',
      description: `Notification deleted: ${notificationId}`,
      metadata: { archived: true }
    });

    const response = createSuccessResponse(
      { deleted: true },
      "Notification deleted successfully"
    );

    return setCorsHeaders(response);
  } catch (error) {
    return handleApiError(error, "Deleting notification");
  }
}
