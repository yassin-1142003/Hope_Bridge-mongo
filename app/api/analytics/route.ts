/**
 * Professional Analytics API Routes
 * 
 * Provides comprehensive analytics and reporting capabilities
 * for the task management dashboard with real-time insights.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { 
  createSuccessResponse, 
  createBadRequestResponse, 
  createUnauthorizedResponse, 
  handleApiError, 
  setCorsHeaders 
} from "@/lib/apiResponse";
import { z } from "zod";

// Validation schemas
const analyticsQuerySchema = z.object({
  type: z.enum(['overview', 'tasks', 'users', 'productivity', 'trends']).default('overview'),
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().email().optional(),
  department: z.string().optional()
});

// Professional analytics manager
class ProfessionalAnalyticsManager {
  async getOverviewAnalytics(query: any, session: any): Promise<any> {
    try {
      const tasksCollection = await getCollection('tasks');
      const usersCollection = await getCollection('users');
      const notificationsCollection = await getCollection('notifications');
      
      // Date range filtering
      const dateFilter = this.buildDateFilter(query);
      
      // Get task statistics
      const [
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        highPriorityTasks
      ] = await Promise.all([
        tasksCollection.countDocuments({ ...dateFilter }),
        tasksCollection.countDocuments({ ...dateFilter, status: 'completed' }),
        tasksCollection.countDocuments({ ...dateFilter, status: 'pending' }),
        tasksCollection.countDocuments({ ...dateFilter, status: 'in_progress' }),
        tasksCollection.countDocuments({ 
          ...dateFilter, 
          endDate: { $lt: new Date() }, 
          status: { $ne: 'completed' } 
        }),
        tasksCollection.countDocuments({ ...dateFilter, priority: { $in: ['high', 'urgent'] } })
      ]);
      
      // Get user statistics
      const totalUsers = await usersCollection.countDocuments({ 
        role: { $ne: 'SUPER_ADMIN' } 
      });
      
      // Get notification statistics
      const unreadNotifications = await notificationsCollection.countDocuments({
        userId: session.user.email,
        read: false,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      });
      
      // Calculate completion rate
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      // Get productivity metrics
      const productivityMetrics = await this.getProductivityMetrics(dateFilter, session);
      
      return {
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          overdue: overdueTasks,
          highPriority: highPriorityTasks,
          completionRate: Math.round(completionRate * 10) / 10
        },
        users: {
          total: totalUsers,
          active: await this.getActiveUsersCount(dateFilter)
        },
        notifications: {
          unread: unreadNotifications,
          total: await notificationsCollection.countDocuments({
            userId: session.user.email,
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          })
        },
        productivity: productivityMetrics,
        period: query.period,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Failed to get overview analytics:', error);
      throw error;
    }
  }
  
  async getTaskAnalytics(query: any, session: any): Promise<any> {
    try {
      const tasksCollection = await getCollection('tasks');
      const dateFilter = this.buildDateFilter(query);
      
      // Task distribution by status
      const statusDistribution = await tasksCollection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray();
      
      // Task distribution by priority
      const priorityDistribution = await tasksCollection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray();
      
      // Task distribution by category
      const categoryDistribution = await tasksCollection.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray();
      
      // Completion trends over time
      const completionTrends = await this.getCompletionTrends(dateFilter);
      
      // Average completion time
      const avgCompletionTime = await this.getAverageCompletionTime(dateFilter);
      
      // Top performers
      const topPerformers = await this.getTopPerformers(dateFilter);
      
      return {
        distribution: {
          status: statusDistribution,
          priority: priorityDistribution,
          category: categoryDistribution
        },
        trends: completionTrends,
        metrics: {
          averageCompletionTime: avgCompletionTime,
          onTimeCompletionRate: await this.getOnTimeCompletionRate(dateFilter)
        },
        performers: topPerformers,
        period: query.period,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Failed to get task analytics:', error);
      throw error;
    }
  }
  
  async getUserAnalytics(query: any, session: any): Promise<any> {
    try {
      const tasksCollection = await getCollection('tasks');
      const usersCollection = await getCollection('users');
      const dateFilter = this.buildDateFilter(query);
      
      // User workload distribution
      const workloadDistribution = await tasksCollection.aggregate([
        { $match: { ...dateFilter, assignedTo: { $exists: true } } },
        { $group: { 
          _id: '$assignedTo', 
          taskCount: { $sum: 1 },
          completedCount: { 
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } 
          },
          overdueCount: {
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $lt: ['$endDate', new Date()] },
                    { $ne: ['$status', 'completed'] }
                  ]
                }, 
                1, 
                0
              ]
            }
          }
        }},
        { $sort: { taskCount: -1 } },
        { $limit: 20 }
      ]).toArray();
      
      // Get user details for workload
      const userEmails = workloadDistribution.map(item => item._id);
      const users = await usersCollection.find({ 
        email: { $in: userEmails } 
      }).toArray();
      
      const userMap: Record<string, any> = {};
      users.forEach((user: any) => {
        userMap[user.email] = user;
      });
      
      // Enrich workload data with user details
      const enrichedWorkload = workloadDistribution.map(item => ({
        user: {
          email: item._id,
          name: userMap[item._id]?.name || 'Unknown User',
          role: userMap[item._id]?.role || 'USER'
        },
        metrics: {
          totalTasks: item.taskCount,
          completedTasks: item.completedCount,
          overdueTasks: item.overdueCount,
          completionRate: item.taskCount > 0 ? (item.completedCount / item.taskCount) * 100 : 0
        }
      }));
      
      // User activity trends
      const activityTrends = await this.getUserActivityTrends(dateFilter);
      
      return {
        workload: enrichedWorkload,
        trends: activityTrends,
        summary: {
          totalActiveUsers: userEmails.length,
          averageTasksPerUser: workloadDistribution.length > 0 
            ? Math.round(workloadDistribution.reduce((sum, item) => sum + item.taskCount, 0) / workloadDistribution.length)
            : 0
        },
        period: query.period,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      throw error;
    }
  }
  
  async getProductivityAnalytics(query: any, session: any): Promise<any> {
    try {
      const tasksCollection = await getCollection('tasks');
      const activityCollection = await getCollection('activity');
      const dateFilter = this.buildDateFilter(query);
      
      // Productivity metrics
      const productivityMetrics = await this.getProductivityMetrics(dateFilter, session);
      
      // Activity patterns
      const activityPatterns = await this.getActivityPatterns(dateFilter);
      
      // Efficiency scores
      const efficiencyScores = await this.getEfficiencyScores(dateFilter);
      
      return {
        metrics: productivityMetrics,
        patterns: activityPatterns,
        efficiency: efficiencyScores,
        period: query.period,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Failed to get productivity analytics:', error);
      throw error;
    }
  }
  
  async getTrendsAnalytics(query: any, session: any): Promise<any> {
    try {
      const tasksCollection = await getCollection('tasks');
      const dateFilter = this.buildDateFilter(query);
      
      // Task creation trends
      const creationTrends = await this.getTaskCreationTrends(dateFilter);
      
      // Completion trends
      const completionTrends = await this.getCompletionTrends(dateFilter);
      
      // Performance trends
      const performanceTrends = await this.getPerformanceTrends(dateFilter);
      
      return {
        creation: creationTrends,
        completion: completionTrends,
        performance: performanceTrends,
        period: query.period,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Failed to get trends analytics:', error);
      throw error;
    }
  }
  
  private buildDateFilter(query: any): any {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;
    
    if (query.startDate && query.endDate) {
      startDate = new Date(query.startDate);
      endDate = new Date(query.endDate);
    } else {
      switch (query.period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }
    
    return {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };
  }
  
  private async getProductivityMetrics(dateFilter: any, session: any): Promise<any> {
    const tasksCollection = await getCollection('tasks');
    
    const metrics = await tasksCollection.aggregate([
      { $match: dateFilter },
      { $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: { 
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } 
        },
        avgCompletionTime: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'completed'] },
              { $subtract: ['$updatedAt', '$createdAt'] },
              null
            ]
          }
        }
      }}
    ]).toArray();
    
    const result = metrics[0] || {
      totalTasks: 0,
      completedTasks: 0,
      avgCompletionTime: 0
    };
    
    return {
      totalTasks: result.totalTasks,
      completedTasks: result.completedTasks,
      completionRate: result.totalTasks > 0 ? (result.completedTasks / result.totalTasks) * 100 : 0,
      averageCompletionTime: result.avgCompletionTime || 0,
      productivityScore: this.calculateProductivityScore(result)
    };
  }
  
  private async getActiveUsersCount(dateFilter: any): Promise<number> {
    const activityCollection = await getCollection('activity');
    return await activityCollection.countDocuments({
      ...dateFilter,
      userId: { $exists: true }
    });
  }
  
  private async getCompletionTrends(dateFilter: any): Promise<any[]> {
    const tasksCollection = await getCollection('tasks');
    
    return await tasksCollection.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
        count: { $sum: 1 }
      }},
      { $sort: { "_id": 1 } }
    ]).toArray();
  }
  
  private async getAverageCompletionTime(dateFilter: any): Promise<number> {
    const tasksCollection = await getCollection('tasks');
    
    const result = await tasksCollection.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      { $group: {
        _id: null,
        avgTime: { $avg: { $subtract: ['$updatedAt', '$createdAt'] } }
      }}
    ]).toArray();
    
    return result[0]?.avgTime || 0;
  }
  
  private async getOnTimeCompletionRate(dateFilter: any): Promise<number> {
    const tasksCollection = await getCollection('tasks');
    
    const result = await tasksCollection.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      { $group: {
        _id: null,
        totalCompleted: { $sum: 1 },
        onTimeCompleted: {
          $sum: { $cond: [{ $lte: ['$updatedAt', '$endDate'] }, 1, 0] }
        }
      }}
    ]).toArray();
    
    const data = result[0];
    return data && data.totalCompleted > 0 ? (data.onTimeCompleted / data.totalCompleted) * 100 : 0;
  }
  
  private async getTopPerformers(dateFilter: any): Promise<any[]> {
    const tasksCollection = await getCollection('tasks');
    
    return await tasksCollection.aggregate([
      { $match: { ...dateFilter, assignedTo: { $exists: true } } },
      { $group: {
        _id: '$assignedTo',
        completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        totalTasks: { $sum: 1 }
      }},
      { $match: { totalTasks: { $gte: 5 } } }, // At least 5 tasks
      { $project: {
        email: '$_id',
        completionRate: { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
        completedTasks: 1,
        totalTasks: 1
      }},
      { $sort: { completionRate: -1, completedTasks: -1 } },
      { $limit: 10 }
    ]).toArray();
  }
  
  private async getUserActivityTrends(dateFilter: any): Promise<any[]> {
    const activityCollection = await getCollection('activity');
    
    return await activityCollection.aggregate([
      { $match: dateFilter },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        activeUsers: { $addToSet: "$userId" }
      }},
      { $project: {
        date: "$_id",
        activeUsersCount: { $size: "$activeUsers" }
      }},
      { $sort: { date: 1 } }
    ]).toArray();
  }
  
  private async getActivityPatterns(dateFilter: any): Promise<any> {
    const activityCollection = await getCollection('activity');
    
    const hourlyPatterns = await activityCollection.aggregate([
      { $match: dateFilter },
      { $group: {
        _id: { $hour: "$createdAt" },
        count: { $sum: 1 }
      }},
      { $sort: { "_id": 1 } }
    ]).toArray();
    
    const dailyPatterns = await activityCollection.aggregate([
      { $match: dateFilter },
      { $group: {
        _id: { $dayOfWeek: "$createdAt" },
        count: { $sum: 1 }
      }},
      { $sort: { "_id": 1 } }
    ]).toArray();
    
    return {
      hourly: hourlyPatterns,
      daily: dailyPatterns
    };
  }
  
  private async getEfficiencyScores(dateFilter: any): Promise<any> {
    const tasksCollection = await getCollection('tasks');
    
    return await tasksCollection.aggregate([
      { $match: { ...dateFilter, assignedTo: { $exists: true } } },
      { $group: {
        _id: '$assignedTo',
        totalTasks: { $sum: 1 },
        completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        onTimeTasks: {
          $sum: { 
            $cond: [
              { $and: [{ $eq: ['$status', 'completed'] }, { $lte: ['$updatedAt', '$endDate'] }] },
              1, 
              0
            ]
          }
        },
        avgTaskDuration: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'completed'] },
              { $subtract: ['$updatedAt', '$createdAt'] },
              null
            ]
          }
        }
      }},
      { $match: { totalTasks: { $gte: 3 } } },
      { $project: {
        email: '$_id',
        efficiencyScore: {
          $multiply: [
            { $divide: ['$completedTasks', '$totalTasks'] },
            { $divide: ['$onTimeTasks', '$completedTasks'] },
            100
          ]
        },
        totalTasks: 1,
        completedTasks: 1,
        avgTaskDuration: 1
      }},
      { $sort: { efficiencyScore: -1 } },
      { $limit: 10 }
    ]).toArray();
  }
  
  private async getTaskCreationTrends(dateFilter: any): Promise<any[]> {
    const tasksCollection = await getCollection('tasks');
    
    return await tasksCollection.aggregate([
      { $match: dateFilter },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }},
      { $sort: { "_id": 1 } }
    ]).toArray();
  }
  
  private async getPerformanceTrends(dateFilter: any): Promise<any[]> {
    const tasksCollection = await getCollection('tasks');
    
    return await tasksCollection.aggregate([
      { $match: dateFilter },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        avgCompletionTime: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'completed'] },
              { $subtract: ['$updatedAt', '$createdAt'] },
              null
            ]
          }
        },
        completionRate: {
          $avg: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        }
      }},
      { $sort: { "_id": 1 } }
    ]).toArray();
  }
  
  private calculateProductivityScore(metrics: any): number {
    if (metrics.totalTasks === 0) return 0;
    
    const completionRate = metrics.completedTasks / metrics.totalTasks;
    const timeEfficiency = metrics.avgCompletionTime > 0 
      ? Math.min(100, (24 * 60 * 60 * 1000) / metrics.avgCompletionTime) // Normalize to 24h
      : 100;
    
    return Math.round((completionRate * 0.7 + timeEfficiency * 0.3) * 100);
  }
}

// Initialize analytics manager
const analyticsManager = new ProfessionalAnalyticsManager();

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

// GET - Get comprehensive analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required to access analytics"));
    }

    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const validatedQuery = analyticsQuerySchema.parse(Object.fromEntries(searchParams));
    
    let analytics;
    
    switch (validatedQuery.type) {
      case 'overview':
        analytics = await analyticsManager.getOverviewAnalytics(validatedQuery, session);
        break;
      case 'tasks':
        analytics = await analyticsManager.getTaskAnalytics(validatedQuery, session);
        break;
      case 'users':
        analytics = await analyticsManager.getUserAnalytics(validatedQuery, session);
        break;
      case 'productivity':
        analytics = await analyticsManager.getProductivityAnalytics(validatedQuery, session);
        break;
      case 'trends':
        analytics = await analyticsManager.getTrendsAnalytics(validatedQuery, session);
        break;
      default:
        analytics = await analyticsManager.getOverviewAnalytics(validatedQuery, session);
    }
    
    const response = createSuccessResponse(
      analytics,
      `Successfully retrieved ${validatedQuery.type} analytics`,
      {
        type: validatedQuery.type,
        period: validatedQuery.period,
        generatedAt: analytics.generatedAt,
      }
    );
    
    return setCorsHeaders(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return setCorsHeaders(createBadRequestResponse(
        error.issues.map((e: any) => e.message).join(', ')
      ));
    }
    return handleApiError(error, "Fetching analytics");
  }
}
