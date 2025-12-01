// app/api/tasks/enhanced/route.ts - Enhanced tasks API endpoint
import { NextRequest, NextResponse } from 'next/server';

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

// Server-side task service (without localStorage dependencies)
class ServerTaskService {
  private tasks: Array<any> = [];
  
  async getFilteredTasks(filters: any): Promise<any[]> {
    // Mock filtered tasks - in real implementation, query database
    return [
      {
        _id: 'task_1',
        title: 'Sample Task 1',
        description: 'Description for task 1',
        status: 'pending',
        priority: 'high',
        assignedTo: 'user1@example.com',
        assignedToName: 'User One',
        createdBy: 'admin@example.com',
        createdByName: 'Admin User',
        startDate: '2025-01-01',
        endDate: '2025-01-15',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        tags: ['urgent', 'backend'],
        category: 'development'
      },
      {
        _id: 'task_2',
        title: 'Sample Task 2',
        description: 'Description for task 2',
        status: 'completed',
        priority: 'medium',
        assignedTo: 'user2@example.com',
        assignedToName: 'User Two',
        createdBy: 'admin@example.com',
        createdByName: 'Admin User',
        startDate: '2025-01-02',
        endDate: '2025-01-10',
        createdAt: '2025-01-02T00:00:00.000Z',
        updatedAt: '2025-01-08T00:00:00.000Z',
        tags: ['frontend', 'ui'],
        category: 'development'
      }
    ];
  }
  
  async getTaskAnalytics(): Promise<any> {
    return {
      totalTasks: 150,
      completedTasks: 120,
      pendingTasks: 25,
      overdueTasks: 5,
      tasksByPriority: { low: 50, medium: 70, high: 25, urgent: 5 },
      tasksByStatus: { pending: 25, in_progress: 5, completed: 120, cancelled: 0 },
      completionRate: 80,
      averageCompletionTime: 3.2
    };
  }
  
  async createTask(taskData: any): Promise<any> {
    const newTask = {
      _id: `task_${Date.now()}`,
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tasks.push(newTask);
    return newTask;
  }
  
  async bulkUpdateTasks(taskIds: string[], updates: any): Promise<void> {
    console.log('Bulk updating tasks:', taskIds, updates);
  }
  
  async bulkDeleteTasks(taskIds: string[]): Promise<void> {
    console.log('Bulk deleting tasks:', taskIds);
  }
  
  async importTasks(tasks: any[], options?: any): Promise<any> {
    console.log('Importing tasks:', tasks.length);
    return {
      imported: tasks.length,
      skipped: 0,
      errors: []
    };
  }
}

const taskService = new ServerTaskService();

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
    const filters: any = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status')?.split(','),
      priority: searchParams.get('priority')?.split(','),
      assignedTo: searchParams.get('assignedTo')?.split(','),
      createdBy: searchParams.get('createdBy')?.split(','),
      tags: searchParams.get('tags')?.split(','),
      categories: searchParams.get('categories')?.split(','),
      dateRange: {
        start: searchParams.get('startDate') || undefined,
        end: searchParams.get('endDate') || undefined
      },
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    };

    // Get filtered tasks
    const tasks = await taskService.getFilteredTasks(filters);
    const analytics = await taskService.getTaskAnalytics();

    return NextResponse.json({
      success: true,
      tasks,
      analytics,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: tasks.length
      }
    });
  } catch (error) {
    console.error('Enhanced tasks API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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

    const formData = await request.formData();
    const taskData = JSON.parse(formData.get('taskData') as string);
    const files = formData.getAll('files') as File[];

    // Create task with files
    const newTask = await taskService.createTask({
      ...taskData,
      files,
      createdBy: authResult.userId || 'unknown'
    });

    return NextResponse.json({
      success: true,
      task: newTask
    });
  } catch (error) {
    console.error('Enhanced tasks API error:', error);
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
    const { action, taskIds, updates } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action' },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case 'bulkUpdate':
        if (!taskIds || !updates) {
          return NextResponse.json(
            { error: 'Missing taskIds or updates for bulk update' },
            { status: 400 }
          );
        }
        result = await taskService.bulkUpdateTasks(taskIds, updates);
        break;

      case 'bulkDelete':
        if (!taskIds) {
          return NextResponse.json(
            { error: 'Missing taskIds for bulk delete' },
            { status: 400 }
          );
        }
        result = await taskService.bulkDeleteTasks(taskIds);
        break;

      case 'import':
        if (!updates?.tasks) {
          return NextResponse.json(
            { error: 'Missing tasks data for import' },
            { status: 400 }
          );
        }
        result = await taskService.importTasks(updates.tasks, updates.options);
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
    console.error('Enhanced tasks API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
