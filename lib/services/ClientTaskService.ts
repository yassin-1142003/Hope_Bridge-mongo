/**
 * Client-Side Task Service
 * 
 * Handles task operations through API calls instead of direct database access
 */

export interface TaskFile {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface Task {
  _id?: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToName?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags?: string[];
  files?: TaskFile[];
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  notes?: string;
  projectId?: string;
  projectName?: string;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  projectId?: string;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
}

class ClientTaskService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/tasks';
  }

  /**
   * Get all tasks with optional filters
   */
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (filters?.projectId) params.append('projectId', filters.projectId);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start);
        params.append('endDate', filters.dateRange.end);
      }

      const response = await fetch(`${this.baseUrl}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Get a single task by ID
   */
  async getTask(id: string): Promise<Task> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch task: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Get task statistics
   */
  async getTaskStats(filters?: TaskFilters): Promise<TaskStats> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (filters?.projectId) params.append('projectId', filters.projectId);
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start);
        params.append('endDate', filters.dateRange.end);
      }

      const response = await fetch(`${this.baseUrl}/stats?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch task stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching task stats:', error);
      throw error;
    }
  }

  /**
   * Upload files for a task
   */
  async uploadFiles(taskId: string, files: File[]): Promise<TaskFile[]> {
    try {
      const formData = new FormData();
      formData.append('taskId', taskId);
      
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`${this.baseUrl}/${taskId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload files: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }

  /**
   * Delete a file from a task
   */
  async deleteFile(taskId: string, fileId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${taskId}/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Assign task to user
   */
  async assignTask(taskId: string, userId: string): Promise<Task> {
    try {
      const response = await fetch(`${this.baseUrl}/${taskId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to assign task: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning task:', error);
      throw error;
    }
  }

  /**
   * Update task progress
   */
  async updateProgress(taskId: string, progress: number): Promise<Task> {
    try {
      const response = await fetch(`${this.baseUrl}/${taskId}/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update progress: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  /**
   * Add comment/note to task
   */
  async addNote(taskId: string, note: string): Promise<Task> {
    try {
      const response = await fetch(`${this.baseUrl}/${taskId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add note: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const taskService = new ClientTaskService();
export default taskService;
