// app/api/admin/activity/route.ts - Admin dashboard for viewing all tracked activities
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { taskTracker } from '@/lib/mongodb/TaskTracker';
import { getCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  return requireAdmin(async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const reportType = searchParams.get('type') || 'dashboard';
      const role = searchParams.get('role');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const limit = parseInt(searchParams.get('limit') || '100');

      // Parse dates if provided
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      let data;

      switch (reportType) {
        case 'dashboard':
          data = await taskTracker.getDashboardData();
          break;
          
        case 'role-report':
          if (!role) {
            return NextResponse.json(
              { error: 'Role parameter is required for role reports' },
              { status: 400 }
            );
          }
          data = await taskTracker.getRoleActivityReport(role, start, end);
          break;
          
        case 'recent-activities':
          data = await getRecentActivities(limit, role, start, end);
          break;
          
        case 'error-analysis':
          data = await getErrorAnalysis(role, start, end);
          break;
          
        case 'performance-metrics':
          data = await getPerformanceMetrics(role, start, end);
          break;
          
        case 'user-activity':
          const userId = searchParams.get('userId');
          if (!userId) {
            return NextResponse.json(
              { error: 'UserId parameter is required for user activity reports' },
              { status: 400 }
            );
          }
          data = await getUserActivityReport(userId, start, end);
          break;
          
        default:
          return NextResponse.json(
            { error: 'Invalid report type' },
            { status: 400 }
          );
      }

      return NextResponse.json({
        success: true,
        data,
        metadata: {
          reportType,
          role,
          startDate: start,
          endDate: end,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Activity dashboard error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

export async function DELETE(request: NextRequest) {
  return requireAdmin(async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const action = searchParams.get('action');
      const olderThan = searchParams.get('olderThan'); // days

      if (!action) {
        return NextResponse.json(
          { error: 'Action parameter is required' },
          { status: 400 }
        );
      }

      const activityCollection = await getCollection('task_activities');
      const metricsCollection = await getCollection('role_metrics');

      let result;

      switch (action) {
        case 'clear-all':
          if (olderThan) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThan));
            
            result = await Promise.all([
              activityCollection.deleteMany({ createdAt: { $lt: cutoffDate } }),
              metricsCollection.deleteMany({ date: { $lt: cutoffDate } })
            ]);
          } else {
            result = await Promise.all([
              activityCollection.deleteMany({}),
              metricsCollection.deleteMany({})
            ]);
          }
          break;

        case 'clear-errors':
          const errorCutoff = olderThan ? 
            new Date(Date.now() - parseInt(olderThan) * 24 * 60 * 60 * 1000) :
            new Date(0);
            
          result = await activityCollection.deleteMany({
            success: false,
            createdAt: { $lt: errorCutoff }
          });
          break;

        case 'clear-role':
          const targetRole = searchParams.get('role');
          if (!targetRole) {
            return NextResponse.json(
              { error: 'Role parameter is required for clear-role action' },
              { status: 400 }
            );
          }
          
          const roleCutoff = olderThan ? 
            new Date(Date.now() - parseInt(olderThan) * 24 * 60 * 60 * 1000) :
            new Date(0);
            
          result = await Promise.all([
            activityCollection.deleteMany({
              userRole: targetRole,
              createdAt: { $lt: roleCutoff }
            }),
            metricsCollection.deleteMany({
              role: targetRole,
              date: { $lt: roleCutoff }
            })
          ]);
          break;

        default:
          return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
          );
      }

      return NextResponse.json({
        success: true,
        message: `Activity cleanup completed`,
        deletedCount: Array.isArray(result) ? 
          result.reduce((sum, res) => sum + res.deletedCount, 0) : 
          result.deletedCount
      });
    } catch (error) {
      console.error('Activity cleanup error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request);
}

// Helper functions for different report types
async function getRecentActivities(limit: number, role?: string, startDate?: Date, endDate?: Date) {
  const activityCollection = await getCollection('task_activities');
  
  const query: any = {};
  if (role) query.userRole = role;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }

  const activities = await activityCollection
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return {
    activities,
    summary: {
      total: activities.length,
      successRate: activities.filter(a => a.success).length / activities.length * 100,
      averageResponseTime: activities.reduce((sum, a) => sum + (a.responseTime || 0), 0) / activities.length
    }
  };
}

async function getErrorAnalysis(role?: string, startDate?: Date, endDate?: Date) {
  const activityCollection = await getCollection('task_activities');
  
  const query: any = { success: false };
  if (role) query.userRole = role;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }

  const errors = await activityCollection
    .find(query)
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  // Analyze error patterns
  const errorAnalysis = {
    totalErrors: errors.length,
  errorsByType: errors.reduce((acc: Record<string, number>, error: any) => {
      const type = error.errorMessage?.split(':')[0] || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}),
    errorsByRole: errors.reduce((acc: Record<string, number>, error: any) => {
      acc[error.userRole] = (acc[error.userRole] || 0) + 1;
      return acc;
    }, {}),
    errorsByEndpoint: errors.reduce((acc: Record<string, number>, error: any) => {
      const endpoint = error.apiEndpoint || 'Unknown';
      acc[endpoint] = (acc[endpoint] || 0) + 1;
      return acc;
    }, {}),
    errorsByHour: errors.reduce((acc: Record<number, number>, error: any) => {
      const hour = new Date(error.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {}),
    recentErrors: errors.slice(0, 50)
  };

  return errorAnalysis;
}

async function getPerformanceMetrics(role?: string, startDate?: Date, endDate?: Date) {
  const activityCollection = await getCollection('task_activities');
  
  const query: any = {};
  if (role) query.userRole = role;
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

  // Calculate performance metrics
  const responseTimes = activities.map(a => a.responseTime || 0).sort((a, b) => a - b);
  const successfulRequests = activities.filter(a => a.success);
  const failedRequests = activities.filter(a => !a.success);

  return {
    summary: {
      totalRequests: activities.length,
      successfulRequests: successfulRequests.length,
      failedRequests: failedRequests.length,
      successRate: (successfulRequests.length / activities.length) * 100,
      averageResponseTime: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
      medianResponseTime: responseTimes[Math.floor(responseTimes.length / 2)],
      p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)],
      p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)]
    },
    slowestEndpoints: activities
      .filter(a => a.responseTime && a.responseTime > 1000)
      .sort((a, b) => (b.responseTime || 0) - (a.responseTime || 0))
      .slice(0, 10)
      .map(a => ({
        endpoint: a.apiEndpoint,
        method: a.httpMethod,
        responseTime: a.responseTime,
        timestamp: a.createdAt
      })),
    performanceByHour: activities.reduce((acc: Record<string, any>, activity: any) => {
      const hour = new Date(activity.createdAt).getHours();
      if (!acc[hour]) {
        acc[hour] = {
          total: 0,
          successful: 0,
          avgResponseTime: 0,
          responseTimes: []
        };
      }
      acc[hour].total++;
      if (activity.success) acc[hour].successful++;
      if (activity.responseTime) {
        acc[hour].responseTimes.push(activity.responseTime);
        acc[hour].avgResponseTime = acc[hour].responseTimes.reduce((sum: number, time: number) => sum + time, 0) / acc[hour].responseTimes.length;
      }
      return acc;
    }, {})
  };
}

async function getUserActivityReport(userId: string, startDate?: Date, endDate?: Date) {
  const activityCollection = await getCollection('task_activities');
  
  const query: any = { userId };
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }

  const activities = await activityCollection
    .find(query)
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();

  const user = activities[0]; // Get user info from first activity

  return {
    user: {
      id: userId,
      name: user?.userName,
      email: user?.userEmail,
      role: user?.userRole,
      department: user?.department
    },
    summary: {
      totalActivities: activities.length,
      successRate: activities.filter(a => a.success).length / activities.length * 100,
      averageResponseTime: activities.reduce((sum, a) => sum + (a.responseTime || 0), 0) / activities.length,
      firstActivity: activities[activities.length - 1]?.createdAt,
      lastActivity: activities[0]?.createdAt
    },
    activitiesByType: activities.reduce((acc: Record<string, number>, activity: any) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {}),
    activitiesByEntity: activities.reduce((acc: Record<string, number>, activity: any) => {
      acc[activity.entityType] = (acc[activity.entityType] || 0) + 1;
      return acc;
    }, {}),
    recentActivities: activities.slice(0, 50),
    dailyActivity: activities.reduce((acc: Record<string, number>, activity: any) => {
      const date = new Date(activity.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {})
  };
}
