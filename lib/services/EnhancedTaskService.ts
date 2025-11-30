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
  async getFilteredTasks(filters: TaskFilters): Promise<Task[]> {
    const cacheKey = `filtered_tasks_${JSON.stringify(filters)}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const allTasks = await this.getAllTasks();
      
      let filteredTasks = allTasks.filter(task => {
        // Status filter
        if (filters.status && task.status !== filters.status) return false;
        
        // Priority filter
        if (filters.priority && task.priority !== filters.priority) return false;
        
        // Assigned to filter
        if (filters.assignedTo && task.assignedTo !== filters.assignedTo) return false;
        
        // Created by filter
        if (filters.createdBy && task.createdBy !== filters.createdBy) return false;
        
        // Date range filter
        if (filters.dateRange) {
          const taskDate = new Date(task.createdAt);
          const startDate = new Date(filters.dateRange.start);
          const endDate = new Date(filters.dateRange.end);
          if (taskDate < startDate || taskDate > endDate) return false;
        }
        
        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          return (
            task.title.toLowerCase().includes(searchLower) ||
            task.description.toLowerCase().includes(searchLower) ||
            task.assignedToName?.toLowerCase().includes(searchLower)
          );
        }
        
        return true;
      });

      // Sort by creation date (newest first)
      filteredTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Cache the result
      this.cache.set(cacheKey, { data: filteredTasks, timestamp: Date.now() });

      return filteredTasks;
    } catch (error) {
      console.error('Error filtering tasks:', error);
      return [];
    }
  }

  // Task analytics
  async getTaskAnalytics(userId?: string): Promise<TaskAnalytics> {
    try {
      const tasks = userId 
        ? await this.getFilteredTasks({ assignedTo: userId })
        : await this.getAllTasks();

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const pendingTasks = tasks.filter(t => t.status === 'pending').length;
      
      // Calculate overdue tasks
      const now = new Date();
      const overdueTasks = tasks.filter(t => 
        t.status !== 'completed' && 
        t.status !== 'cancelled' && 
        new Date(t.endDate) < now
      ).length;

      // Tasks by priority
      const tasksByPriority = tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<Task['priority'], number>);

      // Tasks by status
      const tasksByStatus = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<Task['status'], number>);

      // Completion rate
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Average completion time (in days)
      const completedTasksWithDates = tasks.filter(t => 
        t.status === 'completed' && 
        t.updatedAt && 
        t.createdAt
      );
      
      const averageCompletionTime = completedTasksWithDates.length > 0
        ? completedTasksWithDates.reduce((sum, task) => {
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
      templates.push({ ...template, id: Date.now().toString() });
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
  async exportTasks(format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const tasks = await this.getAllTasks();
      
      if (format === 'json') {
        return JSON.stringify(tasks, null, 2);
      } else {
        // CSV format
        const headers = ['ID', 'Title', 'Description', 'Assigned To', 'Priority', 'Status', 'Start Date', 'End Date', 'Created By', 'Created At'];
        const rows = tasks.map(task => [
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
      }
    } catch (error) {
      console.error('Error exporting tasks:', error);
      throw error;
    }
  }

  async importTasks(data: string, format: 'json' | 'csv' = 'json'): Promise<number> {
    try {
      let tasks: Partial<Task>[];
      
      if (format === 'json') {
        tasks = JSON.parse(data);
      } else {
        // CSV format - simple implementation
        const lines = data.split('\n');
        const headers = lines[0].split(',');
        
        tasks = lines.slice(1).map(line => {
          const values = line.split(',');
          return {
            title: values[1],
            description: values[2],
            assignedTo: values[3],
            priority: values[4] as Task['priority'],
            status: values[5] as Task['status'],
            startDate: values[6],
            endDate: values[7],
            createdBy: values[8]
          };
        });
      }
      
      // Create tasks
      let importedCount = 0;
      for (const taskData of tasks) {
        try {
          await this.createTask(taskData as CreateTaskData);
          importedCount++;
        } catch (error) {
          console.error('Error importing task:', error);
        }
      }
      
      this.clearCache();
      return importedCount;
    } catch (error) {
      console.error('Error importing tasks:', error);
      throw error;
    }
  }
}
