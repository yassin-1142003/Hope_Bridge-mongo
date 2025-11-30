/**
 * Task Service
 * 
 * Handles business logic for task management operations with Cloudinary integration
 */

import { getProfessionalDatabase } from '../professionalDatabase';
import { ObjectId } from 'mongodb';
import { CloudinaryService } from './CloudinaryService';

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
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo?: string;
  createdBy: string;
  startDate?: Date;
  endDate?: Date;
  alerts?: string[];
  files?: TaskFile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskData {
  title: string;
  description: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  createdBy: string;
  startDate?: Date;
  endDate?: Date;
  alerts?: string[];
  files?: TaskFile[];
}

export class TaskService {
  private db = getProfessionalDatabase();
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.cloudinaryService = new CloudinaryService();
  }

  private async ensureConnected(): Promise<void> {
    await this.db.connect();
  }

  async createTask(taskData: CreateTaskData): Promise<Task> {
    // Ensure database is connected
    await this.ensureConnected();
    
    const task = {
      ...taskData,
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      alerts: taskData.alerts || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.db.create('tasks', task);
    
    return {
      _id: result.data._id.toString(),
      ...task
    };
  }

  async getAllTasks(): Promise<Task[]> {
    const result = await this.db.findMany('tasks', {}, { sort: { createdAt: -1 } });
    
    return result.data.map((task: any) => ({
      _id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      startDate: task.startDate,
      endDate: task.endDate,
      alerts: task.alerts,
      files: task.files,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }));
  }

  async getTaskById(id: string): Promise<Task | null> {
    const result = await this.db.findOne('tasks', { _id: new ObjectId(id) });
    
    if (!result.data) return null;
    
    return {
      _id: result.data._id.toString(),
      title: result.data.title,
      description: result.data.description,
      status: result.data.status,
      priority: result.data.priority,
      assignedTo: result.data.assignedTo,
      createdBy: result.data.createdBy,
      startDate: result.data.startDate,
      endDate: result.data.endDate,
      alerts: result.data.alerts,
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt
    };
  }

  async updateTask(id: string, updateData: Partial<CreateTaskData>): Promise<Task | null> {
    const result = await this.db.updateOne('tasks', { _id: new ObjectId(id) }, { $set: updateData });
    
    if (!result.success) return null;
    
    return this.getTaskById(id);
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await this.db.deleteOne('tasks', { _id: new ObjectId(id) });
    return result.success;
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    const result = await this.db.findMany('tasks', { assignedTo: userId }, { sort: { createdAt: -1 } });
    
    return result.data.map((task: any) => ({
      _id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      startDate: task.startDate,
      endDate: task.endDate,
      alerts: task.alerts,
      files: task.files,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }));
  }

  async getTasksNeedingAlerts(): Promise<Task[]> {
    const now = new Date();
    const result = await this.db.findMany('tasks', {
      endDate: { $exists: true, $lte: now },
      status: { $ne: 'completed' }
    }, { sort: { endDate: 1 } });
    
    return result.data.map((task: any) => ({
      _id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      startDate: task.startDate,
      endDate: task.endDate,
      alerts: task.alerts,
      files: task.files,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }));
  }

  async getTaskStats(): Promise<any> {
    const db = getProfessionalDatabase();
    await db.connect();
    
    const stats = await db.getCollectionStats('tasks');
    return stats;
  }

  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  async processFileUpload(files: File[]): Promise<TaskFile[]> {
    const uploadedFiles: TaskFile[] = [];
    
    if (files.length === 0) {
      return uploadedFiles;
    }

    try {
      // Use enhanced upload API with Multer + Cloudinary
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('folder', 'hope-bridge/tasks');

      const response = await fetch('/api/upload-enhanced', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success && data.uploadedFiles) {
        // Transform the response to match TaskFile interface
        data.uploadedFiles.forEach((file: any) => {
          const taskFile: TaskFile = {
            id: file.id,
            name: file.name,
            originalName: file.originalName,
            type: file.type,
            size: file.size,
            url: file.url,
            uploadedAt: file.uploadedAt
          };
          uploadedFiles.push(taskFile);
        });
      } else {
        console.error('Upload failed:', data.message);
        // Fallback to direct Cloudinary upload if enhanced API fails
        return this.fallbackUpload(files);
      }
    } catch (error) {
      console.error('Enhanced upload failed, falling back to direct upload:', error);
      return this.fallbackUpload(files);
    }
    
    return uploadedFiles;
  }

  // Fallback upload method using direct CloudinaryService
  private async fallbackUpload(files: File[]): Promise<TaskFile[]> {
    const uploadedFiles: TaskFile[] = [];
    
    for (const file of files) {
      try {
        // Validate file using Cloudinary service
        const validation = this.cloudinaryService.validateFile(file);
        if (!validation.valid) {
          console.warn(`Skipping file ${file.name}: ${validation.error}`);
          continue;
        }

        // Upload to Cloudinary
        const result = await this.cloudinaryService.uploadFile(file, 'hope-bridge/tasks');
        
        const fileData: TaskFile = {
          id: result.public_id,
          name: file.name,
          originalName: result.original_filename,
          type: this.cloudinaryService.getFileTypeFromUrl(result.secure_url),
          size: result.bytes,
          url: result.secure_url,
          uploadedAt: result.created_at
        };
        
        uploadedFiles.push(fileData);
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        // Continue with other files even if one fails
      }
    }
    
    return uploadedFiles;
  }
}
