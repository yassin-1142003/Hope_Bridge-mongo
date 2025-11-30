// lib/notifications/NotificationManager.ts - Real-time notification system
import { authManager } from '../auth-enhanced';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'task_assigned' | 'task_completed' | 'task_overdue';
  timestamp: string;
  read: boolean;
  userId: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  taskAssigned: boolean;
  taskCompleted: boolean;
  taskOverdue: boolean;
  systemUpdates: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
}

export class NotificationManager {
  private static instance: NotificationManager;
  private subscribers: Set<(notifications: Notification[]) => void> = new Set();
  private notifications: Notification[] = [];
  private settings: NotificationSettings;
  private pollingInterval: NodeJS.Timeout | null = null;
  private readonly POLLING_INTERVAL = 30000; // 30 seconds

  private constructor() {
    this.settings = this.loadSettings();
    this.initializeNotifications();
    this.startPolling();
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Notification management
  async addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };

    // Check quiet hours
    if (this.settings.quietHours.enabled && this.isInQuietHours()) {
      // Queue notification for later if it's not urgent
      if (notification.priority !== 'urgent') {
        this.queueNotificationForLater(newNotification);
        return;
      }
    }

    // Add to local notifications
    this.notifications.unshift(newNotification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    // Save to storage
    this.saveNotifications();

    // Send to server
    await this.syncNotification(newNotification);

    // Show browser notification if enabled and allowed
    if (this.settings.push && this.hasPermission()) {
      this.showBrowserNotification(newNotification);
    }

    // Notify subscribers
    this.notifySubscribers();

    // Send email if enabled
    if (this.settings.email) {
      await this.sendEmailNotification(newNotification);
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.saveNotifications();
      await this.syncNotificationStatus(notificationId, true);
      this.notifySubscribers();
    }
  }

  async markAllAsRead(): Promise<void> {
    const unreadNotifications = this.notifications.filter(n => !n.read);
    
    for (const notification of unreadNotifications) {
      notification.read = true;
    }

    this.saveNotifications();
    
    // Bulk sync to server
    await this.syncBulkNotificationStatus(unreadNotifications.map(n => n.id), true);
    
    this.notifySubscribers();
  }

  async deleteNotification(notificationId: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    await this.deleteNotificationFromServer(notificationId);
    this.notifySubscribers();
  }

  clearAll(): void {
    this.notifications = [];
    this.saveNotifications();
    this.notifySubscribers();
  }

  // Getters
  getNotifications(): Notification[] {
    return this.notifications;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  getNotificationsByType(type: Notification['type']): Notification[] {
    return this.notifications.filter(n => n.type === type);
  }

  // Settings management
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // Request permission if push notifications were enabled
    if (newSettings.push && !this.hasPermission()) {
      this.requestPermission();
    }
  }

  getSettings(): NotificationSettings {
    return this.settings;
  }

  // Subscription management
  subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.subscribers.add(callback);
    callback(this.notifications);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.notifications);
      } catch (error) {
        console.error('Error in notification subscriber callback:', error);
      }
    });
  }

  // Browser notifications
  private async showBrowserNotification(notification: Notification): Promise<void> {
    if (!('Notification' in window)) return;

    try {
      const notificationOptions: NotificationOptions = {
        body: notification.message,
        icon: '/logo.webp',
        badge: '/logo.webp',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        actions: notification.actionUrl ? [
          {
            action: 'view',
            title: notification.actionText || 'View'
          }
        ] : undefined
      };

      const browserNotification = new Notification(notification.title, notificationOptions);

      browserNotification.onclick = (event) => {
        event.preventDefault();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
        this.markAsRead(notification.id);
      };

      // Auto-close after 5 seconds for non-urgent notifications
      if (notification.priority !== 'urgent') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  }

  private hasPermission(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  private async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return this.hasPermission();
  }

  // Quiet hours management
  private isInQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = this.settings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = this.settings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      // Same day range (e.g., 22:00 to 06:00)
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight range (e.g., 22:00 to 06:00 next day)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private queueNotificationForLater(notification: Notification): void {
    const queuedNotifications = JSON.parse(localStorage.getItem('queued_notifications') || '[]');
    queuedNotifications.push(notification);
    localStorage.setItem('queued_notifications', JSON.stringify(queuedNotifications));
  }

  private processQueuedNotifications(): void {
    if (this.isInQuietHours()) return;

    const queuedNotifications = JSON.parse(localStorage.getItem('queued_notifications') || '[]');
    if (queuedNotifications.length === 0) return;

    queuedNotifications.forEach((notification: Notification) => {
      this.addNotification(notification);
    });

    localStorage.removeItem('queued_notifications');
  }

  // Server synchronization
  private async syncNotification(notification: Notification): Promise<void> {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        console.error('Failed to sync notification to server');
      }
    } catch (error) {
      console.error('Error syncing notification:', error);
    }
  }

  private async syncNotificationStatus(notificationId: string, read: boolean): Promise<void> {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ read })
      });
    } catch (error) {
      console.error('Error syncing notification status:', error);
    }
  }

  private async syncBulkNotificationStatus(notificationIds: string[], read: boolean): Promise<void> {
    try {
      await fetch('/api/notifications/bulk-read', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ notificationIds, read })
      });
    } catch (error) {
      console.error('Error syncing bulk notification status:', error);
    }
  }

  private async deleteNotificationFromServer(notificationId: string): Promise<void> {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
    } catch (error) {
      console.error('Error deleting notification from server:', error);
    }
  }

  private async fetchNotificationsFromServer(): Promise<void> {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (response.ok) {
        const serverNotifications = await response.json();
        this.notifications = serverNotifications;
        this.saveNotifications();
        this.notifySubscribers();
      }
    } catch (error) {
      console.error('Error fetching notifications from server:', error);
    }
  }

  // Email notifications
  private async sendEmailNotification(notification: Notification): Promise<void> {
    try {
      await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(notification)
      });
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  // Storage management
  private saveNotifications(): void {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  private loadNotifications(): Notification[] {
    try {
      const stored = localStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  private saveSettings(): void {
    localStorage.setItem('notification_settings', JSON.stringify(this.settings));
  }

  private loadSettings(): NotificationSettings {
    const defaultSettings: NotificationSettings = {
      email: true,
      push: true,
      inApp: true,
      taskAssigned: true,
      taskCompleted: true,
      taskOverdue: true,
      systemUpdates: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };

    try {
      const stored = localStorage.getItem('notification_settings');
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return defaultSettings;
    }
  }

  // Initialization and polling
  private initializeNotifications(): void {
    this.notifications = this.loadNotifications();
    
    // Process any queued notifications
    this.processQueuedNotifications();

    // Request permission for push notifications
    if (this.settings.push) {
      this.requestPermission();
    }
  }

  private startPolling(): void {
    this.pollingInterval = setInterval(async () => {
      await this.fetchNotificationsFromServer();
    }, this.POLLING_INTERVAL);
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private getAuthToken(): string {
    return localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token') || '';
  }

  // Cleanup
  destroy(): void {
    this.stopPolling();
    this.subscribers.clear();
  }

  // Email notification methods
  async sendEmailNotification(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    from?: string;
    replyTo?: string;
  }): Promise<{ messageId: string; sent: boolean }> {
    try {
      // In a real implementation, this would use a service like:
      // - SendGrid
      // - AWS SES
      // - Nodemailer with SMTP
      // - Resend
      
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

  // Email logs storage
  private emailLogs: Array<{
    messageId: string;
    to: string;
    subject: string;
    sentAt: string;
    status: 'sent' | 'failed' | 'pending';
  }> = [];

  // Utility methods for task-related notifications
  async notifyTaskAssigned(taskTitle: string, assignedTo: string, assignedToName: string): Promise<void> {
    await this.addNotification({
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${taskTitle}`,
      type: 'info',
      userId: assignedTo,
      priority: 'medium',
      actionUrl: '/dashboard/tasks',
      actionText: 'View Task',
      metadata: { taskTitle, assignedTo, assignedToName }
    });
  }

  async notifyTaskCompleted(taskTitle: string, assignedTo: string, assignedToName: string): Promise<void> {
    await this.addNotification({
      title: 'Task Completed',
      message: `Task "${taskTitle}" has been completed by ${assignedToName}`,
      type: 'success',
      userId: assignedTo,
      priority: 'low',
      actionUrl: '/dashboard/tasks',
      actionText: 'View Tasks',
      metadata: { taskTitle, assignedTo, assignedToName }
    });
  }

  async notifyTaskOverdue(taskTitle: string, assignedTo: string, assignedToName: string): Promise<void> {
    await this.addNotification({
      title: 'Task Overdue',
      message: `Task "${taskTitle}" is overdue and needs your attention`,
      type: 'warning',
      userId: assignedTo,
      priority: 'high',
      actionUrl: '/dashboard/tasks',
      actionText: 'View Task',
      metadata: { taskTitle, assignedTo, assignedToName }
    });
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();
