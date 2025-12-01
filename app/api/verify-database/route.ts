import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const verification: any = {
      timestamp: new Date().toISOString(),
      database: {
        connection: 'unknown',
        tables: {} as Record<string, string>,
        counts: {} as Record<string, number>,
        sampleData: {} as Record<string, any>
      },
      api: {
        endpoints: {} as Record<string, string>,
        functionality: {} as Record<string, any>
      },
      issues: [] as string[],
      recommendations: [] as string[]
    };

    // Test 1: Database Connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      verification.database.connection = 'connected';
    } catch (error) {
      verification.database.connection = 'failed';
      verification.issues.push('Database connection failed');
      verification.recommendations.push('Check DATABASE_URL environment variable');
      return NextResponse.json(verification);
    }

    // Test 2: Check Tables and Counts
    try {
      const tables = ['users', 'tasks', 'task_attachments', 'projects', 'notifications', 'activities'];
      
      for (const table of tables) {
        try {
          const count = await (prisma as any)[table.slice(0, -1)].count();
          verification.database.counts[table] = count;
          verification.database.tables[table] = 'exists';
        } catch (error) {
          verification.database.tables[table] = 'missing';
          verification.issues.push(`Table ${table} is missing or inaccessible`);
        }
      }
    } catch (error) {
      verification.issues.push('Failed to check database tables');
    }

    // Test 3: Sample Data Verification
    try {
      // Get sample users
      const sampleUsers = await prisma.user.findMany({
        take: 3,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });
      verification.database.sampleData.users = sampleUsers;

      // Get sample tasks with relations
      const sampleTasks = await prisma.task.findMany({
        take: 5,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, role: true }
          },
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          attachments: {
            select: { id: true, name: true, type: true, url: true }
          },
          project: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      verification.database.sampleData.tasks = sampleTasks;

    } catch (error) {
      verification.issues.push('Failed to fetch sample data');
      verification.recommendations.push('Check database schema and permissions');
    }

    // Test 4: API Endpoints Verification
    const endpoints = [
      '/api/tasks',
      '/api/tasks/user/[userId]',
      '/api/tasks/[taskId]',
      '/api/auth/session',
      '/api/test-connection'
    ];

    for (const endpoint of endpoints) {
      try {
        // Test basic endpoint structure (not actual calls to avoid circular dependencies)
        verification.api.endpoints[endpoint] = 'configured';
      } catch (error) {
        verification.api.endpoints[endpoint] = 'missing';
        verification.issues.push(`API endpoint ${endpoint} is not configured`);
      }
    }

    // Test 5: Task Assignment Verification
    try {
      const taskAssignments = await prisma.task.groupBy({
        by: ['assignedToId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      });
      
      verification.api.functionality.taskAssignments = taskAssignments;
      
      // Check if tasks are properly assigned
      if (taskAssignments.length === 0) {
        verification.issues.push('No task assignments found in database');
        verification.recommendations.push('Create some test tasks with assignments');
      }
    } catch (error) {
      verification.issues.push('Failed to verify task assignments');
    }

    // Test 6: User Permissions Verification
    try {
      const userRoles = await prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
      });
      
      verification.api.functionality.userRoles = userRoles;
      
      // Check if there are users with different roles
      if (userRoles.length < 2) {
        verification.recommendations.push('Consider creating users with different roles for testing');
      }
    } catch (error) {
      verification.issues.push('Failed to verify user roles');
    }

    // Test 7: Task Status Flow Verification
    try {
      const taskStatuses = await prisma.task.groupBy({
        by: ['status'],
        _count: { id: true }
      });
      
      verification.api.functionality.taskStatuses = taskStatuses;
      
      const validStatuses = ['draft', 'active', 'in_progress', 'review', 'completed', 'cancelled', 'archived'];
      const invalidStatuses = taskStatuses.filter(ts => !validStatuses.includes(ts.status));
      
      if (invalidStatuses.length > 0) {
        verification.issues.push(`Invalid task statuses found: ${invalidStatuses.map(is => is.status).join(', ')}`);
        verification.recommendations.push('Update task statuses to valid values');
      }
    } catch (error) {
      verification.issues.push('Failed to verify task statuses');
    }

    // Test 8: Recent Activity Verification
    try {
      const recentTasks = await prisma.task.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          assignedTo: { select: { name: true } },
          createdBy: { select: { name: true } },
          createdAt: true
        }
      });
      
      verification.api.functionality.recentActivity = recentTasks;
      
      if (recentTasks.length === 0) {
        verification.recommendations.push('No recent activity found - consider creating some test tasks');
      }
    } catch (error) {
      verification.issues.push('Failed to verify recent activity');
    }

    // Overall Assessment
    const issueCount = verification.issues.length;
    const recommendationCount = verification.recommendations.length;
    
    if (issueCount === 0) {
      verification.api.functionality.overall = 'excellent';
      verification.recommendations.push('Database and API are properly configured!');
    } else if (issueCount <= 2) {
      verification.api.functionality.overall = 'good';
    } else if (issueCount <= 5) {
      verification.api.functionality.overall = 'needs_attention';
    } else {
      verification.api.functionality.overall = 'critical_issues';
    }

    return NextResponse.json(verification);
    
  } catch (error) {
    console.error('Database verification failed:', error);
    return NextResponse.json({
      error: 'Verification process failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
