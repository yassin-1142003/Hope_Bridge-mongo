// lib/services/EnhancedTaskService.ts - Enhanced task service with advanced features
import { TaskServiceClient, type Task, type CreateTaskData, type User } from './TaskServiceClient';

export interface TaskFilters {
  status?: Task['status'];
  priority?: Task['priority'];
  assignedTo?: string;
  createdBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
  tags?: string[];
  categories?: string[];
}

export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  tasksByPriority: Record<Task['priority'], number>;
  tasksByStatus: Record<Task['status'], number>;
  completionRate: number;
  averageCompletionTime: number;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  taskAssigned: boolean;
  taskCompleted: boolean;
  taskOverdue: boolean;
}

export class EnhancedTaskService extends TaskServiceClient {
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    super();
    this.initializeRealtimeUpdates();
  }

  // Advanced filtering and search
  async getFilteredTasks(filters: TaskFilters, page: number = 1, limit: number = 20): Promise<Task[]> {
    const cacheKey = `filtered_tasks_${JSON.stringify(filters)}_${page}_${limit}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    
    // Build query parameters
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters.createdBy) params.append('createdBy', filters.createdBy);
    if (filters.search) params.append('search', filters.search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/tasks?${params}`, {
        headers,
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch filtered tasks: ${response.status}`);
      }

      const result = await response.json();
      const tasks = result.data || result.tasks || [];
      
      // Cache the result
      this.cache.set(cacheKey, { data: tasks, timestamp: Date.now() });
      
      return tasks;
    } catch (error) {
      console.error('Error fetching filtered tasks:', error);
      return [];
    }
  }

  // Task analytics
  async getTaskAnalytics(userId?: string): Promise<TaskAnalytics> {
    try {
      const tasks = userId 
        ? await this.getFilteredTasks({ assignedTo: userId })
        : await this.getAllTasks();
      
      const taskArray = Array.isArray(tasks) ? tasks : tasks.tasks || [];

      const totalTasks = taskArray.length;
      const completedTasks = taskArray.filter((t: any) => t.status === 'completed').length;
      const pendingTasks = taskArray.filter((t: any) => t.status === 'pending').length;
      
      // Calculate overdue tasks
      const now = new Date();
      const overdueTasks = taskArray.filter((t: any) => 
        t.status !== 'completed' && 
        t.status !== 'cancelled' && 
        new Date(t.endDate) < now
      ).length;

      // Tasks by priority
      const tasksByPriority = taskArray.reduce((acc: any, task: any) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<Task['priority'], number>);

      // Tasks by status
      const tasksByStatus = taskArray.reduce((acc: any, task: any) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<Task['status'], number>);

      // Completion rate
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Average completion time (in days)
      const completedTasksWithDates = taskArray.filter((t: any) => 
        t.status === 'completed' && 
        t.updatedAt && 
        t.createdAt
      );
      
      const averageCompletionTime = completedTasksWithDates.length > 0
        ? completedTasksWithDates.reduce((sum: number, task: any) => {
            const created = new Date(task.createdAt).getTime();
            const completed = new Date(task.updatedAt).getTime();
            return sum + (completed - created) / (1000 * 60 * 60 * 24); // Convert to days
          }, 0) / completedTasksWithDates.length
        : 0;

      return {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        tasksByPriority,
        tasksByStatus,
        completionRate,
        averageCompletionTime
      };
    } catch (error) {
      console.error('Error getting task analytics:', error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        tasksByPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
        tasksByStatus: { pending: 0, in_progress: 0, completed: 0, cancelled: 0 },
        completionRate: 0,
        averageCompletionTime: 0
      };
    }
  }

  // Bulk operations
  async bulkUpdateTasks(taskIds: string[], updates: Partial<Task>): Promise<void> {
    try {
      await Promise.all(taskIds.map(id => this.updateTask(id, updates)));
      this.notifySubscribers('tasks_updated', { taskIds, updates });
    } catch (error) {
      console.error('Error bulk updating tasks:', error);
      throw error;
    }
  }

  async bulkDeleteTasks(taskIds: string[]): Promise<void> {
    try {
      await Promise.all(taskIds.map(id => this.deleteTask(id)));
      this.notifySubscribers('tasks_deleted', { taskIds });
      this.clearCache(); // Clear cache after bulk deletion
    } catch (error) {
      console.error('Error bulk deleting tasks:', error);
      throw error;
    }
  }

  // Task templates
  async createTaskTemplate(template: Omit<CreateTaskData, 'assignedTo'> & { name: string }): Promise<void> {
    try {
      const templates = this.getTaskTemplates();
      // Add a default assignedTo for template (empty string or user can set it later)
      const taskTemplate = { 
        ...template, 
        assignedTo: '', // Default empty, user will set when using template
        id: Date.now().toString() 
      };
      templates.push(taskTemplate);
      localStorage.setItem('task_templates', JSON.stringify(templates));
    } catch (error) {
      console.error('Error creating task template:', error);
      throw error;
    }
  }

  getTaskTemplates(): Array<CreateTaskData & { name: string; id: string }> {
    try {
      const stored = localStorage.getItem('task_templates');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting task templates:', error);
      return [];
    }
  }

  // Analytics and reporting methods
  async getTaskTrends(dateRange?: { start: string; end: string }): Promise<any[]> {
    // Mock trend data - in real implementation, this would query database
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

  async exportTasks(filters?: TaskFilters, format: 'json' | 'csv' = 'json'): Promise<any> {
    const result = await this.getAllTasks();
    const tasks = Array.isArray(result) ? result : result.tasks || [];
    const analytics = await this.getTaskAnalytics();
    const trends = await this.getTaskTrends(filters?.dateRange);
    const productivity = await this.getProductivityMetrics();

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
    const tasks = await this.getFilteredTasks(filters);
    
    return {
      totalTasks: tasks.length,
      averageCompletionTime: this.calculateAverageCompletionTime(tasks),
      tasksByUser: this.groupTasksByUser(tasks),
      tasksByPriority: this.groupTasksByPriority(tasks),
      completionRate: this.calculateCompletionRate(tasks),
      overdueRate: this.calculateOverdueRate(tasks)
    };
  }

  // Helper methods for analytics
  private convertToCSV(data: any): string {
    // Simple CSV conversion - in real implementation, use a proper CSV library
    const headers = ['Date', 'Created', 'Completed', 'Overdue'];
    const rows = data.trends.map((trend: any) => [
      trend.date,
      trend.created,
      trend.completed,
      trend.overdue
    ]);
    
    return [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
  }

  private convertToPDF(data: any): Buffer {
    // PDF conversion - in real implementation, use a library like jsPDF or Puppeteer
    return Buffer.from('PDF content placeholder');
  }

  private calculateAverageCompletionTime(tasks: any[]): number {
    // Mock calculation
    return 3.2; // days
  }

  private groupTasksByUser(tasks: any[]): any {
    // Mock grouping
    return {};
  }

  private groupTasksByPriority(tasks: any[]): any {
    // Mock grouping
    return {};
  }

  private calculateCompletionRate(tasks: any[]): number {
    const completed = tasks.filter(t => t.status === 'completed').length;
    return (completed / tasks.length) * 100;
  }

  private calculateOverdueRate(tasks: any[]): number {
    const overdue = tasks.filter(t => t.status === 'overdue').length;
    return (overdue / tasks.length) * 100;
  }

  // Real-time updates
  private initializeRealtimeUpdates(): void {
    // Simulate real-time updates with polling
    setInterval(async () => {
      try {
        const currentTasks = await this.getAllTasks();
        const cachedTasks = this.cache.get('all_tasks')?.data;
        
        if (cachedTasks && JSON.stringify(currentTasks) !== JSON.stringify(cachedTasks)) {
          this.cache.set('all_tasks', { data: currentTasks, timestamp: Date.now() });
          this.notifySubscribers('tasks_updated', { tasks: currentTasks });
        }
      } catch (error) {
        console.error('Error in real-time update:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    
    const callbacks = this.subscribers.get(event)!;
    callbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.subscribers.delete(event);
      }
    };
  }

  private notifySubscribers(event: string, data: any): void {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  // Cache management
  private clearCache(): void {
    this.cache.clear();
  }

  // Export/Import functionality
  async exportTasksToCSV(): Promise<string> {
    try {
      const result = await this.getAllTasks();
      const tasks = Array.isArray(result) ? result : result.tasks || [];
      
      // CSV format
      const headers = ['ID', 'Title', 'Description', 'Assigned To', 'Priority', 'Status', 'Start Date', 'End Date', 'Created By', 'Created At'];
      const rows = tasks.map((task: any) => [
        task._id,
        task.title,
        task.description,
        task.assignedToName || task.assignedTo,
        task.priority,
        task.status,
        task.startDate,
        task.endDate,
        task.createdByName || task.createdBy,
        task.createdAt
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } catch (error) {
      console.error('Error exporting tasks:', error);
      throw error;
    }
  }

  async importTasks(tasks: Partial<Task>[], options?: { overwrite?: boolean }): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const result = { imported: 0, skipped: 0, errors: [] as string[] };
    
    for (const taskData of tasks) {
      try {
        // Validate required fields
        if (!taskData.title || !taskData.assignedTo) {
          result.errors.push(`Task missing required fields: ${taskData.title || 'Untitled'}`);
          result.skipped++;
          continue;
        }
        
        // Check if task already exists (if not overwriting)
        if (!options?.overwrite) {
          const existingTasksResult = await this.getAllTasks();
          const existingTasks = Array.isArray(existingTasksResult) ? existingTasksResult : existingTasksResult.tasks || [];
          const exists = existingTasks.some((t: any) => 
            t.title === taskData.title && 
            t.assignedTo === taskData.assignedTo
          );
          
          if (exists) {
            result.skipped++;
            continue;
          }
        }
        
        // Create task
        await this.createTask(taskData as CreateTaskData);
        result.imported++;
      } catch (error) {
        result.errors.push(`Failed to import task: ${taskData.title} - ${error}`);
        result.skipped++;
      }
    }
    
    this.clearCache();
    return result;
  }
}
