// app/api/notifications/route.ts - Notifications API endpoint
import { NextRequest, NextResponse } from 'next/server';

// Server-side notification manager (not using client-side localStorage)
class ServerNotificationManager {
  private notifications: Array<any> = [];
  private emailLogs: Array<any> = [];
  
  async addNotification(notification: any): Promise<any> {
    const newNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    
    this.notifications.push(newNotification);
    
    // Keep only last 1000 notifications
    if (this.notifications.length > 1000) {
      this.notifications = this.notifications.slice(-1000);
    }
    
    return newNotification;
  }
  
  async getUserNotifications(userId: string, limit: number = 50): Promise<any[]> {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
  
  async getAllNotifications(limit: number = 50): Promise<any[]> {
    return this.notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
  
  async markAsRead(notificationId: string): Promise<boolean> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }
  
  async markAsUnread(notificationId: string): Promise<boolean> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = false;
      return true;
    }
    return false;
  }
  
  async deleteNotification(notificationId: string): Promise<boolean> {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      return true;
    }
    return false;
  }
  
  async sendEmailNotification(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    from?: string;
    replyTo?: string;
  }): Promise<{ messageId: string; sent: boolean }> {
    try {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Mock email sending
      console.log('Sending email:', {
        to: options.to,
        subject: options.subject,
        messageId
      });
      
      // Store email log
      this.emailLogs.push({
        messageId,
        to: options.to,
        subject: options.subject,
        sentAt: new Date().toISOString(),
        status: 'sent'
      });
      
      return { messageId, sent: true };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
  
  async getEmailNotificationLogs(status?: string, limit: number = 50): Promise<any[]> {
    let logs = [...this.emailLogs];
    
    if (status) {
      logs = logs.filter(log => log.status === status);
    }
    
    return logs.slice(0, limit);
  }
}

const serverNotificationManager = new ServerNotificationManager();

// Simple auth verification (without external dependencies)
async function verifyAuth(request: NextRequest): Promise<{ isAuthenticated: boolean; userId?: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAuthenticated: false };
    }
    
    const token = authHeader.substring(7);
    
    // Simple JWT validation (in production, use proper JWT library)
    const parts = token.split('.');
    if (parts.length !== 3) return { isAuthenticated: false };
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    const now = Date.now() / 1000;
    
    if (payload.exp && payload.exp < now) {
      return { isAuthenticated: false };
    }
    
    return { 
      isAuthenticated: true, 
      userId: payload.id || payload.email || 'unknown' 
    };
  } catch (error) {
    return { isAuthenticated: false };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, title, message, userId, priority, metadata } = body;

    // Validate required fields
    if (!title || !message || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, message, userId' },
        { status: 400 }
      );
    }

    // Create notification
    const notification = await serverNotificationManager.addNotification({
      title,
      message,
      type: type || 'info',
      userId,
      priority: priority || 'medium',
      metadata: metadata || {},
      actionUrl: metadata?.actionUrl,
      actionText: metadata?.actionText
    });

    return NextResponse.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unread = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get notifications
    let notifications;
    if (userId) {
      notifications = await serverNotificationManager.getUserNotifications(userId, limit);
    } else {
      notifications = await serverNotificationManager.getAllNotifications(limit);
    }

    // Filter by unread status if requested
    if (unread) {
      notifications = notifications.filter(n => !n.read);
    }

    return NextResponse.json({
      success: true,
      notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId, action } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing notificationId' },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case 'markRead':
        result = await serverNotificationManager.markAsRead(notificationId);
        break;
      case 'markUnread':
        result = await serverNotificationManager.markAsUnread(notificationId);
        break;
      case 'delete':
        result = await serverNotificationManager.deleteNotification(notificationId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
