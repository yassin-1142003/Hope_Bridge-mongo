// lib/services/TaskServiceClient.ts - Client-side task service using API calls
import type { User, UserRole } from '@/lib/roles';

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  createdBy: string;
  createdByName?: string;
  files?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  alertBeforeDue?: boolean;
  alertDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  department?: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  alertBeforeDue?: boolean;
  alertDays?: number;
  files?: File[];
}

export class TaskServiceClient {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  protected async getAuthHeaders(): Promise<Record<string, string>> {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      return headers;
    }
    return { 'Content-Type': 'application/json' };
  }

  async getAllTasks(page: number = 1, limit: number = 20): Promise<{ tasks: Task[]; total: number; hasMore: boolean }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/tasks?page=${page}&limit=${limit}`, {
        headers,
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }

      const result = await response.json();
      const tasks = result.data || result.tasks || [];
      const total = result.metadata?.pagination?.total || 0;
      const totalPages = result.metadata?.pagination?.totalPages || 1;
      const hasMore = page < totalPages;

      return { tasks, total, hasMore };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { tasks: [], total: 0, hasMore: false };
    }
  }

  async createTask(data: CreateTaskData): Promise<Task> {
    try {
      const headers = await this.getAuthHeaders();
      
      // Process files if any
      let processedFiles: any[] = [];
      if (data.files && data.files.length > 0) {
        processedFiles = await this.processFileUpload(data.files);
      }

      const taskData = {
        ...data,
        files: processedFiles
      };

      const response = await fetch(`${this.baseUrl}/api/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.status}`);
      }

      const result = await response.json();
      return result.data || result.task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async processFileUpload(files: File[]): Promise<Array<{ id: string; name: string; url: string; type: string; size: number }>> {
    try {
      const uploadedFiles = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const headers = await this.getAuthHeaders();
        // Remove Content-Type to let browser set it with boundary
        const { 'Content-Type': contentType, ...headersWithoutContentType } = headers;
        
        const response = await fetch(`${this.baseUrl}/api/upload`, {
          method: 'POST',
          headers: headersWithoutContentType,
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          uploadedFiles.push({
            id: result.data?.id || Date.now().toString(),
            name: file.name,
            url: result.data?.url || '',
            type: file.type,
            size: file.size
          });
        }
      }
      
      return uploadedFiles;
    } catch (error) {
      console.error('Error processing file upload:', error);
      return [];
    }
  }

  async getUsers(filters?: { role?: string; department?: string; isActive?: boolean }): Promise<User[]> {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams();
      
      if (filters?.role) params.append('role', filters.role);
      if (filters?.department) params.append('department', filters.department);
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      
      const response = await fetch(`${this.baseUrl}/api/users?${params.toString()}`, {
        headers,
        cache: 'no-store'
      });

      if (!response.ok) {
        console.warn('Failed to fetch users, returning mock data');
        return this.getMockUsers();
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return this.getMockUsers();
    }
  }

  private getMockUsers(): User[] {
    return [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@hopebridge.com',
        role: 'ADMIN' as UserRole,
        department: 'Management',
        isActive: true,
        avatar: '/avatars/admin.jpg'
      },
      {
        id: '2',
        name: 'Project Coordinator',
        email: 'coordinator@hopebridge.com',
        role: 'PROJECT_COORDINATOR' as UserRole,
        department: 'Projects',
        isActive: true,
        avatar: '/avatars/coordinator.jpg'
      },
      {
        id: '3',
        name: 'Field Officer',
        email: 'field@hopebridge.com',
        role: 'FIELD_OFFICER' as UserRole,
        department: 'Operations',
        isActive: true,
        avatar: '/avatars/field.jpg'
      },
      {
        id: '4',
        name: 'HR Manager',
        email: 'hr@hopebridge.com',
        role: 'HR' as UserRole,
        department: 'Human Resources',
        isActive: true,
        avatar: '/avatars/hr.jpg'
      }
    ];
  }
}
