/**
 * Task Notification Service
 * 
 * Professional service for automatically generating and managing task notifications
 * with smart filtering, priority handling, and real-time updates.
 */

import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface TaskNotificationData {
  type: 'new_task_assigned' | 'task_updated' | 'task_completed' | 'task_overdue' | 'task_cancelled';
  taskId: string;
  taskData: any;
  assignedTo?: string;
  assignedBy?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  actionRequired?: boolean;
  metadata?: Record<string, any>;
}

class TaskNotificationService {
  private static instance: TaskNotificationService;
  
  public static getInstance(): TaskNotificationService {
    if (!TaskNotificationService.instance) {
      TaskNotificationService.instance = new TaskNotificationService();
    }
    return TaskNotificationService.instance;
  }
  
  /**
   * Create a task notification
   */
  async createNotification(data: TaskNotificationData): Promise<void> {
    try {
      const notificationsCollection = await getCollection('notifications');
      
      const notification = {
        _id: new ObjectId(),
        type: data.type,
        taskId: data.taskId,
        title: this.generateTitle(data.type, data.taskData),
        message: this.generateMessage(data.type, data.taskData),
        assignedTo: data.assignedTo,
        assignedBy: data.assignedBy,
        createdBy: data.assignedBy,
        read: false,
        archived: false,
        actionRequired: data.actionRequired || this.requiresAction(data.type),
        priority: data.priority || data.taskData?.priority || 'medium',
        dueDate: data.dueDate || data.taskData?.endDate,
        metadata: {
          ...data.metadata,
          taskTitle: data.taskData?.title,
          taskPriority: data.taskData?.priority,
          taskStatus: data.taskData?.status,
          originalAssignedTo: data.taskData?.assignedTo,
          originalAssignedBy: data.taskData?.createdBy
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await notificationsCollection.insertOne(notification);
      
      // Log activity for audit trail
      await this.logActivity({
        action: 'notification_created',
        type: data.type,
        taskId: data.taskId,
        assignedTo: data.assignedTo,
        metadata: notification.metadata
      });
      
    } catch (error) {
      console.error('Failed to create task notification:', error);
      throw error;
    }
  }
  
  /**
   * Create notifications for task assignment
   */
  async notifyTaskAssignment(taskId: string, taskData: any, assignedTo: string, assignedBy: string): Promise<void> {
    await this.createNotification({
      type: 'new_task_assigned',
      taskId,
      taskData,
      assignedTo,
      assignedBy,
      priority: taskData.priority,
      dueDate: taskData.endDate,
      actionRequired: true,
      metadata: {
        previousAssignee: taskData.assignedTo,
        newAssignee: assignedTo
      }
    });
  }
  
  /**
   * Create notifications for task updates
   */
  async notifyTaskUpdate(taskId: string, taskData: any, changes: any, updatedBy: string): Promise<void> {
    // Only notify if significant changes were made
    const significantFields = ['title', 'description', 'priority', 'status', 'endDate', 'assignedTo'];
    const hasSignificantChanges = Object.keys(changes).some(key => significantFields.includes(key));
    
    if (!hasSignificantChanges) return;
    
    await this.createNotification({
      type: 'task_updated',
      taskId,
      taskData,
      assignedTo: taskData.assignedTo,
      assignedBy: updatedBy,
      priority: taskData.priority,
      dueDate: taskData.endDate,
      actionRequired: changes.status === 'in_progress' || changes.priority === 'urgent',
      metadata: {
        changes,
        updatedFields: Object.keys(changes)
      }
    });
    
    // If task was reassigned, notify the new assignee
    if (changes.assignedTo && changes.assignedTo !== taskData.assignedTo) {
      await this.notifyTaskAssignment(taskId, taskData, changes.assignedTo, updatedBy);
    }
  }
  
  /**
   * Create notifications for task completion
   */
  async notifyTaskCompletion(taskId: string, taskData: any, completedBy: string): Promise<void> {
    await this.createNotification({
      type: 'task_completed',
      taskId,
      taskData,
      assignedTo: taskData.assignedTo,
      assignedBy: completedBy,
      priority: taskData.priority,
      actionRequired: false,
      metadata: {
        completedAt: new Date().toISOString(),
        completedBy
      }
    });
    
    // Notify the person who assigned the task
    if (taskData.createdBy && taskData.createdBy !== completedBy) {
      await this.createNotification({
        type: 'task_completed',
        taskId,
        taskData,
        assignedTo: taskData.createdBy,
        assignedBy: completedBy,
        priority: taskData.priority,
        actionRequired: false,
        metadata: {
          completedAt: new Date().toISOString(),
          completedBy,
          originalAssignee: taskData.assignedTo
        }
      });
    }
  }
  
  /**
   * Create notifications for overdue tasks
   */
  async notifyOverdueTasks(): Promise<void> {
    try {
      const tasksCollection = await getCollection('tasks');
      const notificationsCollection = await getCollection('notifications');
      
      const now = new Date();
      const overdueTasks = await tasksCollection.find({
        endDate: { $lt: now },
        status: { $nin: ['completed', 'cancelled'] }
      }).toArray();
      
      for (const task of overdueTasks) {
        // Check if we already sent an overdue notification recently
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const existingNotification = await notificationsCollection.findOne({
          taskId: task._id.toString(),
          type: 'task_overdue',
          createdAt: { $gt: oneDayAgo }
        });
        
        if (!existingNotification) {
          await this.createNotification({
            type: 'task_overdue',
            taskId: task._id.toString(),
            taskData: task,
            assignedTo: task.assignedTo,
            assignedBy: task.createdBy,
            priority: 'urgent',
            dueDate: task.endDate,
            actionRequired: true,
            metadata: {
              overdueDays: Math.floor((now.getTime() - new Date(task.endDate).getTime()) / (1000 * 60 * 60 * 24)),
              originalDueDate: task.endDate
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to notify overdue tasks:', error);
    }
  }
  
  /**
   * Create notifications for task cancellation
   */
  async notifyTaskCancellation(taskId: string, taskData: any, cancelledBy: string): Promise<void> {
    await this.createNotification({
      type: 'task_cancelled',
      taskId,
      taskData,
      assignedTo: taskData.assignedTo,
      assignedBy: cancelledBy,
      priority: taskData.priority,
      actionRequired: false,
      metadata: {
        cancelledAt: new Date().toISOString(),
        cancelledBy,
        reason: taskData.cancellationReason || 'No reason provided'
      }
    });
  }
  
  /**
   * Check for upcoming due dates and send reminders
   */
  async checkUpcomingDueDates(): Promise<void> {
    try {
      const tasksCollection = await getCollection('tasks');
      const notificationsCollection = await getCollection('notifications');
      
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      // Find tasks due in the next 24 hours
      const upcomingTasks = await tasksCollection.find({
        endDate: { $gte: now, $lte: tomorrow },
        status: { $nin: ['completed', 'cancelled'] }
      }).toArray();
      
      for (const task of upcomingTasks) {
        // Check if we already sent a reminder today
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const existingNotification = await notificationsCollection.findOne({
          taskId: task._id.toString(),
          type: 'task_updated',
          'metadata.reminderType': 'due_soon',
          createdAt: { $gte: today }
        });
        
        if (!existingNotification) {
          await this.createNotification({
            type: 'task_updated',
            taskId: task._id.toString(),
            taskData: {
              ...task,
              title: task.title,
              description: `Reminder: Task due soon`
            },
            assignedTo: task.assignedTo,
            assignedBy: task.createdBy,
            priority: task.priority === 'urgent' ? 'urgent' : 'high',
            dueDate: task.endDate,
            actionRequired: true,
            metadata: {
              reminderType: 'due_soon',
              hoursUntilDue: Math.floor((new Date(task.endDate).getTime() - now.getTime()) / (1000 * 60 * 60))
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to check upcoming due dates:', error);
    }
  }
  
  /**
   * Clean up old notifications
   */
  async cleanupOldNotifications(daysToKeep: number = 30): Promise<void> {
    try {
      const notificationsCollection = await getCollection('notifications');
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      // Delete old read notifications
      await notificationsCollection.deleteMany({
        read: true,
        createdAt: { $lt: cutoffDate },
        type: { $in: ['new_task_assigned', 'task_updated', 'task_completed', 'task_overdue', 'task_cancelled'] }
      });
      
      // Archive old unread notifications (keep them but don't show in main feed)
      await notificationsCollection.updateMany({
        read: false,
        createdAt: { $lt: cutoffDate },
        type: { $in: ['new_task_assigned', 'task_updated', 'task_completed', 'task_overdue', 'task_cancelled'] },
        archived: { $ne: true }
      }, {
        $set: { archived: true, updatedAt: new Date() }
      });
      
    } catch (error) {
      console.error('Failed to cleanup old notifications:', error);
    }
  }
  
  /**
   * Get notification statistics
   */
  async getNotificationStats(userId?: string): Promise<any> {
    try {
      const notificationsCollection = await getCollection('notifications');
      
      const matchStage: any = {
        type: { $in: ['new_task_assigned', 'task_updated', 'task_completed', 'task_overdue', 'task_cancelled'] }
      };
      
      if (userId) {
        matchStage.$or = [
          { assignedTo: userId },
          { createdBy: userId }
        ];
      }
      
      const stats = await notificationsCollection.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: { $sum: { $cond: ['$read', 0, 1] } },
            actionRequired: { $sum: { $cond: ['$actionRequired', 1, 0] } },
            byType: {
              $push: {
                type: '$type',
                count: 1
              }
            },
            byPriority: {
              $push: {
                priority: '$priority',
                count: 1
              }
            }
          }
        }
      ]).toArray();
      
      return stats[0] || {
        total: 0,
        unread: 0,
        actionRequired: 0,
        byType: [],
        byPriority: []
      };
      
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      return {
        total: 0,
        unread: 0,
        actionRequired: 0,
        byType: [],
        byPriority: []
      };
    }
  }
  
  // Helper methods
  private generateTitle(type: string, taskData: any): string {
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
  
  private generateMessage(type: string, taskData: any): string {
    const taskTitle = taskData?.title || 'a task';
    
    switch (type) {
      case 'new_task_assigned':
        return `You have been assigned: "${taskTitle}"`;
      case 'task_updated':
        return `"${taskTitle}" has been updated`;
      case 'task_completed':
        return `"${taskTitle}" has been completed`;
      case 'task_overdue':
        return `"${taskTitle}" is overdue and needs your attention`;
      case 'task_cancelled':
        return `"${taskTitle}" has been cancelled`;
      default:
        return `Update regarding "${taskTitle}"`;
    }
  }
  
  private requiresAction(type: string): boolean {
    return ['new_task_assigned', 'task_overdue'].includes(type);
  }
  
  private async logActivity(activity: any): Promise<void> {
    try {
      const activityCollection = await getCollection('activity_logs');
      await activityCollection.insertOne({
        ...activity,
        createdAt: new Date(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}

// Export singleton instance
export const taskNotificationService = TaskNotificationService.getInstance();
