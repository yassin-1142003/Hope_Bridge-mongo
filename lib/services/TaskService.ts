/**
 * Task Service
 * 
 * Handles business logic for task management operations
 */

import { getCollection } from "@/lib/mongodb";
import { UserRole, hasPermission } from "@/lib/roles";
import { ObjectId } from "mongodb";

export interface Task {
  _id?: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  alertBeforeDue: boolean;
  alertDays: number;
  files: TaskFile[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskFile {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export class TaskService {
  private tasksCollection = () => getCollection('tasks');

  async getAllTasks(filters?: {
    status?: string;
    assignedTo?: string;
    priority?: string;
  }, pagination?: {
    page: number;
    limit: number;
  }) {
    const collection = await this.tasksCollection();
    const query: any = {};
    
    if (filters?.status) query.status = filters.status;
    if (filters?.assignedTo) query.assignedTo = filters.assignedTo;
    if (filters?.priority) query.priority = filters.priority;
    
    const skip = pagination ? (pagination.page - 1) * pagination.limit : 0;
    const limit = pagination?.limit || 10;
    
    const [tasks, total] = await Promise.all([
      collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query)
    ]);
    
    return { tasks, total };
  }

  async getTaskById(id: string) {
    const collection = await this.tasksCollection();
    const task = await collection.findOne({ _id: new ObjectId(id) });
    return task;
  }

  async createTask(taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) {
    const collection = await this.tasksCollection();
    const task = {
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(task);
    return { ...task, _id: result.insertedId };
  }

  async updateTask(id: string, updates: Partial<Task>) {
    const collection = await this.tasksCollection();
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    return result.modifiedCount > 0;
  }

  async deleteTask(id: string) {
    const collection = await this.tasksCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async getTasksByAssignee(assigneeEmail: string) {
    const collection = await this.tasksCollection();
    const tasks = await collection.find({ assignedTo: assigneeEmail }).sort({ createdAt: -1 }).toArray();
    return tasks;
  }

  async getTaskStats() {
    const collection = await this.tasksCollection();
    
    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks
    ] = await Promise.all([
      collection.countDocuments(),
      collection.countDocuments({ status: 'pending' }),
      collection.countDocuments({ status: 'in_progress' }),
      collection.countDocuments({ status: 'completed' }),
      collection.countDocuments({ 
        status: { $in: ['pending', 'in_progress'] },
        dueDate: { $lt: new Date() }
      })
    ]);
    
    return {
      total: totalTasks,
      pending: pendingTasks,
      inProgress: inProgressTasks,
      completed: completedTasks,
      overdue: overdueTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    };
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
    
    for (const file of files) {
      // In a real implementation, you would:
      // 1. Save the file to storage (local, S3, etc.)
      // 2. Generate a unique filename
      // 3. Store the file metadata in database
      
      const fileData: TaskFile = {
        id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        originalName: file.name,
        type: file.type,
        size: file.size,
        url: `/uploads/tasks/${Date.now()}-${file.name}`, // Placeholder URL
        uploadedAt: new Date().toISOString()
      };
      
      uploadedFiles.push(fileData);
    }
    
    return uploadedFiles;
  }

  // Alert functionality
  async createTaskWithAlert(taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const collection = await this.tasksCollection();
    
    const task = {
      ...taskData,
      alertBeforeDue: taskData.alertBeforeDue || false,
      alertDays: taskData.alertDays || 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(task);
    
    // Schedule alert if needed
    if (task.alertBeforeDue && task.endDate) {
      await this.scheduleTaskAlert({
        taskId: result.insertedId.toString(),
        taskTitle: task.title,
        assignedTo: task.assignedTo,
        alertDate: this.calculateAlertDate(task.endDate, task.alertDays),
        message: this.generateAlertMessage(task.title, task.endDate, task.alertDays),
        isSent: false,
        createdAt: new Date()
      });
    }
    
    return {
      _id: result.insertedId.toString(),
      ...task
    };
  }

  async getTasksNeedingAlerts(): Promise<Task[]> {
    const collection = await this.tasksCollection();
    const now = new Date();
    
    const tasks = await collection
      .find({
        alertBeforeDue: true,
        status: { $in: ['pending', 'in_progress'] },
        endDate: { $gt: now }
      })
      .toArray();
    
    return tasks
      .filter(task => {
        const alertDate = this.calculateAlertDate(task.endDate, task.alertDays);
        return alertDate <= now;
      })
      .map(task => ({
        _id: task._id.toString(),
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo,
        assignedBy: task.assignedBy,
        priority: task.priority,
        startDate: task.startDate,
        endDate: task.endDate,
        status: task.status,
        alertBeforeDue: task.alertBeforeDue,
        alertDays: task.alertDays,
        files: task.files,
        createdBy: task.createdBy,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }));
  }

  private async scheduleTaskAlert(alert: {
    taskId: string;
    taskTitle: string;
    assignedTo: string;
    alertDate: Date;
    message: string;
    isSent: boolean;
    createdAt: Date;
  }): Promise<void> {
    const alertsCollection = await getCollection('taskAlerts');
    await alertsCollection.insertOne(alert);
  }

  private calculateAlertDate(endDate: Date, alertDays: number): Date {
    const alertDate = new Date(endDate);
    alertDate.setDate(alertDate.getDate() - alertDays);
    return alertDate;
  }

  private generateAlertMessage(taskTitle: string, endDate: Date, alertDays: number): string {
    const endDateStr = endDate.toLocaleDateString();
    const daysText = alertDays === 1 ? '1 day' : `${alertDays} days`;
    return `Reminder: Task "${taskTitle}" is due on ${endDateStr} (${daysText} remaining)`;
  }
}
