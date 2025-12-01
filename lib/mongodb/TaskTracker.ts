// lib/mongodb/TaskTracker.ts - Comprehensive task and role activity tracking system
import { getCollection } from '../mongodb';
import { ObjectId } from 'mongodb';

export interface TaskActivity {
  _id?: ObjectId;
  userId: string;
  userRole: 'ADMIN' | 'PROJECT_COORDINATOR' | 'FIELD_OFFICER' | 'HR' | 'VOLUNTEER' | 'USER';
  userName: string;
  userEmail: string;
  action: string;
  entityType: 'task' | 'project' | 'user' | 'notification' | 'system' | 'email' | 'file' | 'api';
  entityId: string;
  entityName: string;
  operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'SEND' | 'RECEIVE' | 'LOGIN' | 'LOGOUT' | 'ASSIGN' | 'COMPLETE';
  description: string;
  dataSent?: any;
  dataReceived?: any;
  apiEndpoint?: string;
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  statusCode?: number;
  responseTime?: number; // in milliseconds
  success: boolean;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  department?: string;
  metadata?: {
    [key: string]: any;
    previousValues?: any;
    newValues?: any;
    affectedUsers?: string[];
    attachments?: string[];
    notificationsSent?: number;
  };
  createdAt: Date;
}

export interface RoleMetrics {
  _id?: ObjectId;
  role: string;
  date: Date; // YYYY-MM-DD format
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByEntity: Record<string, number>;
  successfulActions: number;
  failedActions: number;
  averageResponseTime: number;
  mostActiveUsers: Array<{
    userId: string;
    userName: string;
    actionCount: number;
  }>;
  peakHours: Array<{
    hour: number; // 0-23
    actionCount: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export class TaskTracker {
  private static instance: TaskTracker;

  static getInstance(): TaskTracker {
    if (!TaskTracker.instance) {
      TaskTracker.instance = new TaskTracker();
    }
    return TaskTracker.instance;
  }

  /**
   * Log any user activity with comprehensive tracking
   */
  async logActivity(activity: Omit<TaskActivity, 'createdAt'>): Promise<void> {
    try {
      const activityCollection = await getCollection('task_activities');
      
      const activityDoc: TaskActivity = {
        ...activity,
        createdAt: new Date(),
        responseTime: activity.responseTime || 0
      };

      await activityCollection.insertOne(activityDoc);

      // Also update role metrics
      await this.updateRoleMetrics(activity);

      console.log(`📝 Activity logged: ${activity.userRole} - ${activity.action} on ${activity.entityType}`);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  /**
   * Log API requests with full context
   */
  async logApiRequest(context: {
    userId: string;
    userRole: string;
    userName: string;
    userEmail: string;
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    requestBody?: any;
    responseBody?: any;
    success: boolean;
    errorMessage?: string;
    ipAddress?: string;
    userAgent?: string;
    department?: string;
  }): Promise<void> {
    const entityType = this.extractEntityTypeFromEndpoint(context.endpoint);
    const action = this.extractActionFromOperation(context.method, context.statusCode);

    await this.logActivity({
      userId: context.userId,
      userRole: context.userRole as any,
      userName: context.userName,
      userEmail: context.userEmail,
      action,
      entityType,
      entityId: this.extractEntityIdFromEndpoint(context.endpoint),
      entityName: `${entityType} API`,
      operation: this.extractOperationFromMethod(context.method),
      description: `${context.userRole} performed ${context.method} on ${context.endpoint}`,
      dataSent: context.requestBody,
      dataReceived: context.responseBody,
      apiEndpoint: context.endpoint,
      httpMethod: context.method as any,
      statusCode: context.statusCode,
      responseTime: context.responseTime,
      success: context.success,
      errorMessage: context.errorMessage,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      department: context.department
    });
  }

  /**
   * Log task-specific operations
   */
  async logTaskOperation(context: {
    userId: string;
    userRole: string;
    userName: string;
    userEmail: string;
    taskId: string;
    taskTitle: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN' | 'COMPLETE';
    previousValues?: any;
    newValues?: any;
    assignedTo?: string;
    department?: string;
    success: boolean;
    errorMessage?: string;
  }): Promise<void> {
    await this.logActivity({
      userId: context.userId,
      userRole: context.userRole as any,
      userName: context.userName,
      userEmail: context.userEmail,
      action: `task_${context.operation.toLowerCase()}`,
      entityType: 'task',
      entityId: context.taskId,
      entityName: context.taskTitle,
      operation: context.operation,
      description: `${context.userRole} ${context.operation.toLowerCase()}d task: ${context.taskTitle}`,
      dataSent: context.newValues,
      dataReceived: context.previousValues,
      success: context.success,
      errorMessage: context.errorMessage,
      department: context.department,
      metadata: {
        previousValues: context.previousValues,
        newValues: context.newValues,
        assignedTo: context.assignedTo
      }
    });
  }

  /**
   * Log notification operations
   */
  async logNotificationOperation(context: {
    userId: string;
    userRole: string;
    userName: string;
    userEmail: string;
    notificationType: string;
    recipients: string[];
    message: string;
    success: boolean;
    errorMessage?: string;
    notificationsSent?: number;
  }): Promise<void> {
    await this.logActivity({
      userId: context.userId,
      userRole: context.userRole as any,
      userName: context.userName,
      userEmail: context.userEmail,
      action: 'send_notification',
      entityType: 'notification',
      entityId: `bulk_${Date.now()}`,
      entityName: `${context.notificationType} notification`,
      operation: 'SEND',
      description: `${context.userRole} sent ${context.notificationType} notifications to ${context.recipients.length} recipients`,
      dataSent: {
        message: context.message,
        recipients: context.recipients,
        type: context.notificationType
      },
      success: context.success,
      errorMessage: context.errorMessage,
      metadata: {
        affectedUsers: context.recipients,
        notificationsSent: context.notificationsSent || context.recipients.length
      }
    });
  }

  /**
   * Get comprehensive activity report for a specific role
   */
  async getRoleActivityReport(role: string, startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const activityCollection = await getCollection('task_activities');
      
      const query: any = { userRole: role };
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = startDate;
        if (endDate) query.createdAt.$lte = endDate;
      }

      const activities = await activityCollection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(1000)
        .toArray();

      // Generate comprehensive report
      const report = {
        role,
        period: {
          startDate: startDate || new Date(0),
          endDate: endDate || new Date()
        },
        summary: {
          totalActivities: activities.length,
          successRate: activities.filter(a => a.success).length / activities.length * 100,
          averageResponseTime: activities.reduce((sum: number, a: any) => sum + (a.responseTime || 0), 0) / activities.length,
          uniqueUsers: [...new Set(activities.map((a: any) => a.userId))].length
        },
        activitiesByType: this.groupBy(activities, 'action'),
        activitiesByEntity: this.groupBy(activities, 'entityType'),
        activitiesByOperation: this.groupBy(activities, 'operation'),
        topUsers: this.getTopUsers(activities),
        recentActivities: activities.slice(0, 50),
        errorAnalysis: this.analyzeErrors(activities)
      };

      return report;
    } catch (error) {
      console.error('Failed to generate role activity report:', error);
      throw error;
    }
  }

  /**
   * Get real-time dashboard data for monitoring
   */
  async getDashboardData(): Promise<any> {
    try {
      const activityCollection = await getCollection('task_activities');
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [recentActivities, totalActivities, roleStats] = await Promise.all([
        activityCollection.find({ createdAt: { $gte: last24Hours } }).sort({ createdAt: -1 }).limit(100).toArray(),
        activityCollection.countDocuments(),
        activityCollection.aggregate([
          { $match: { createdAt: { $gte: last24Hours } } },
          { $group: { _id: '$userRole', count: { $sum: 1 }, success: { $sum: { $cond: ['$success', 1, 0] } } } },
          { $sort: { count: -1 } }
        ]).toArray()
      ]);

      return {
        summary: {
          totalActivities,
          last24Hours: recentActivities.length,
          successRate: recentActivities.filter(a => a.success).length / recentActivities.length * 100 || 0
        },
        roleBreakdown: roleStats,
        recentActivities: recentActivities.slice(0, 20),
        alerts: await this.generateAlerts(recentActivities)
      };
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      throw error;
    }
  }

  // Private helper methods
  private async updateRoleMetrics(activity: Omit<TaskActivity, 'createdAt'>): Promise<void> {
    try {
      const metricsCollection = await getCollection('role_metrics');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existing = await metricsCollection.findOne({
        role: activity.userRole,
        date: today
      });

      const metricsData = {
        totalActions: 1,
        actionsByType: { [activity.action]: 1 },
        actionsByEntity: { [activity.entityType]: 1 },
        successfulActions: activity.success ? 1 : 0,
        failedActions: activity.success ? 0 : 1,
        averageResponseTime: activity.responseTime || 0,
        mostActiveUsers: [{
          userId: activity.userId,
          userName: activity.userName,
          actionCount: 1
        }],
        peakHours: [{
          hour: new Date().getHours(),
          actionCount: 1
        }]
      };

      if (existing) {
        await metricsCollection.updateOne(
          { _id: existing._id },
          {
            $inc: {
              totalActions: 1,
              [`actionsByType.${activity.action}`]: 1,
              [`actionsByEntity.${activity.entityType}`]: 1,
              successfulActions: activity.success ? 1 : 0,
              failedActions: activity.success ? 0 : 1
            },
            $set: {
              updatedAt: new Date(),
              averageResponseTime: (existing.averageResponseTime + (activity.responseTime || 0)) / 2
            },
            $push: {
              peakHours: {
                hour: new Date().getHours(),
                actionCount: 1
              } as any
            }
          }
        );
      } else {
        await metricsCollection.insertOne({
          role: activity.userRole,
          date: today,
          ...metricsData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to update role metrics:', error);
    }
  }

  private extractEntityTypeFromEndpoint(endpoint: string): 'task' | 'project' | 'user' | 'notification' | 'system' | 'api' {
    if (endpoint.includes('/tasks')) return 'task';
    if (endpoint.includes('/projects')) return 'project';
    if (endpoint.includes('/users')) return 'user';
    if (endpoint.includes('/notifications')) return 'notification';
    if (endpoint.includes('/admin')) return 'system';
    return 'api';
  }

  private extractActionFromOperation(method: string, statusCode: number): string {
    if (method === 'GET') return 'read';
    if (method === 'POST') return statusCode < 400 ? 'create' : 'create_failed';
    if (method === 'PUT' || method === 'PATCH') return statusCode < 400 ? 'update' : 'update_failed';
    if (method === 'DELETE') return statusCode < 400 ? 'delete' : 'delete_failed';
    return 'unknown';
  }

  private extractOperationFromMethod(method: string): TaskActivity['operation'] {
    switch (method) {
      case 'GET': return 'READ';
      case 'POST': return 'CREATE';
      case 'PUT':
      case 'PATCH': return 'UPDATE';
      case 'DELETE': return 'DELETE';
      default: return 'READ';
    }
  }

  private extractEntityIdFromEndpoint(endpoint: string): string {
    const parts = endpoint.split('/');
    return parts[parts.length - 1] || 'unknown';
  }

  private groupBy(items: any[], key: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = item[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  private getTopUsers(activities: any[]): any[] {
    const userCounts = this.groupBy(activities, 'userId');
    return Object.entries(userCounts)
      .map(([userId, count]) => ({
        userId,
        userName: activities.find(a => a.userId === userId)?.userName || 'Unknown',
        actionCount: count as number
      }))
      .sort((a, b) => b.actionCount - a.actionCount)
      .slice(0, 10);
  }

  private analyzeErrors(activities: any[]): any {
    const errors = activities.filter(a => !a.success);
    return {
      totalErrors: errors.length,
      errorRate: errors.length / activities.length * 100,
      commonErrors: this.groupBy(errors, 'errorMessage'),
      errorsByType: this.groupBy(errors, 'action'),
      errorsByRole: this.groupBy(errors, 'userRole')
    };
  }

  private async generateAlerts(recentActivities: any[]): Promise<any[]> {
    const alerts = [];
    
    // High error rate alert
    const errorRate = recentActivities.filter(a => !a.success).length / recentActivities.length;
    if (errorRate > 0.2) {
      alerts.push({
        type: 'error_rate',
        severity: 'high',
        message: `High error rate detected: ${(errorRate * 100).toFixed(1)}%`,
        timestamp: new Date()
      });
    }

    // Slow response time alert
    const avgResponseTime: number = recentActivities.reduce((sum: number, a: any) => sum + (a.responseTime || 0), 0) / recentActivities.length;
    if (avgResponseTime > 2000) {
      alerts.push({
        type: 'slow_response',
        severity: 'medium',
        message: `Slow average response time: ${avgResponseTime.toFixed(0)}ms`,
        timestamp: new Date()
      });
    }

    return alerts;
  }
}

export const taskTracker = TaskTracker.getInstance();
