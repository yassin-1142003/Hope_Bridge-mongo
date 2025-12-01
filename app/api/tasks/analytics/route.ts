// app/api/tasks/analytics/route.ts - Task analytics API endpoint
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
  
  async getTaskTrends(dateRange?: { start?: string; end?: string }): Promise<any[]> {
    // Mock trend data
    const trends = [];
    const start = dateRange?.start ? new Date(dateRange.start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = dateRange?.end ? new Date(dateRange.end) : new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      trends.push({
        date: date.toISOString().split('T')[0],
        created: Math.floor(Math.random() * 10) + 5,
        completed: Math.floor(Math.random() * 8) + 3,
        overdue: Math.floor(Math.random() * 3)
      });
    }
    
    return trends;
  }
  
  async getProductivityMetrics(userId?: string, department?: string): Promise<any[]> {
    // Mock productivity data
    return [
      { day: 'Mon', tasks: 12, hours: 8, efficiency: 85.0 },
      { day: 'Tue', tasks: 15, hours: 8.5, efficiency: 88.2 },
      { day: 'Wed', tasks: 18, hours: 9, efficiency: 90.0 },
      { day: 'Thu', tasks: 14, hours: 7.5, efficiency: 93.3 },
      { day: 'Fri', tasks: 16, hours: 8, efficiency: 92.0 },
      { day: 'Sat', tasks: 8, hours: 4, efficiency: 80.0 },
      { day: 'Sun', tasks: 5, hours: 3, efficiency: 83.3 }
    ];
  }
  
  async exportAnalytics(filters: any, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<any> {
    const analytics = await this.getTaskAnalytics();
    const trends = await this.getTaskTrends(filters.dateRange);
    const productivity = await this.getProductivityMetrics(filters.userId, filters.department);

    const exportData = {
      analytics,
      trends,
      productivity,
      exportedAt: new Date().toISOString(),
      filters
    };

    if (format === 'json') {
      return exportData;
    } else if (format === 'csv') {
      // Convert to CSV format
      return this.convertToCSV(exportData);
    } else if (format === 'pdf') {
      // Convert to PDF format
      return this.convertToPDF(exportData);
    }
  }
  
  async getCustomAnalytics(filters: any): Promise<any> {
    // Custom analytics based on filters
    return {
      totalTasks: 150,
      averageCompletionTime: 3.2,
      tasksByUser: {},
      tasksByPriority: { low: 50, medium: 70, high: 25, urgent: 5 },
      completionRate: 80,
      overdueRate: 3.3
    };
  }
  
  private convertToCSV(data: any): string {
    // Simple CSV conversion
    const headers = ['Date', 'Created', 'Completed', 'Overdue'];
    const rows = data.trends.map((trend: any) => [
      trend.date,
      trend.created,
      trend.completed,
      trend.overdue
    ]);
    
    return [headers.join(','), ...rows.map((row: string[]) => row.join(','))].join('\n');
  }

  private convertToPDF(data: any): Buffer {
    // PDF conversion - in real implementation, use a library
    return Buffer.from('PDF content placeholder');
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
    const dateRange = {
      start: searchParams.get('startDate') || undefined,
      end: searchParams.get('endDate') || undefined
    };
    const userId = searchParams.get('userId') || undefined;
    const department = searchParams.get('department') || undefined;

    // Get comprehensive analytics
    const analytics = await taskService.getTaskAnalytics();
    const trends = await taskService.getTaskTrends(dateRange);
    const productivity = await taskService.getProductivityMetrics(userId, department);

    return NextResponse.json({
      success: true,
      analytics: {
        overview: analytics,
        trends,
        productivity,
        dateRange
      }
    });
  } catch (error) {
    console.error('Task analytics API error:', error);
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

    const body = await request.json();
    const { type, filters, exportFormat } = body;

    // Generate analytics report
    let report;
    switch (type) {
      case 'export':
        report = await taskService.exportAnalytics(filters, exportFormat || 'json');
        break;
      
      case 'custom':
        report = await taskService.getCustomAnalytics(filters);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid analytics type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Task analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
