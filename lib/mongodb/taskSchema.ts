/**
 * Task Management System Schema
 * 
 * Complete task data model for organization with role-based access
 */

import { Schema, model, models } from 'mongoose';

// Form field types that GM can create
export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'select' | 'checkbox' | 'radio' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // for select, radio, checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// Form data structure
export interface TaskForm {
  title: string;
  description: string;
  fields: FormField[];
  instructions?: string;
}

// Employee response structure
export interface EmployeeResponse {
  [fieldId: string]: any; // fieldId as key, response value as value
}

// File attachment structure
export interface TaskFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Activity log structure
export interface TaskActivity {
  id: string;
  action: 'CREATED' | 'ASSIGNED' | 'VIEWED' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVIEWED' | 'COMPLETED' | 'CANCELLED';
  performedBy: string;
  performedByRole: string;
  timestamp: Date;
  comment?: string;
  metadata?: any;
}

// Main Task Schema
export interface ITask {
  _id: string;
  title: string;
  description: string;
  
  // Assignment details
  assignedBy: string; // GM id
  assignedByName: string;
  assignedTo: string; // user id
  assignedToName: string;
  assignedToRole: string;
  
  // Status management
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'CANCELLED';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Form and responses
  formData: TaskForm; // The form GM sends
  employeeResponse?: EmployeeResponse; // The submitted form by user
  
  // File attachments
  attachments: TaskFile[]; // Files from GM
  responseFiles: TaskFile[]; // Files from user
  
  // Activity tracking
  activities: TaskActivity[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  completedAt?: Date;
  dueDate?: Date;
  
  // Additional metadata
  category?: string;
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
}

// MongoDB Schema Definition
const FormFieldSchema = new Schema<FormField>({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['text', 'textarea', 'number', 'email', 'date', 'select', 'checkbox', 'radio', 'file']
  },
  label: { type: String, required: true },
  placeholder: { type: String },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
  validation: {
    min: { type: Number },
    max: { type: Number },
    pattern: { type: String }
  }
}, { _id: false });

const TaskFormSchema = new Schema<TaskForm>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  fields: [FormFieldSchema],
  instructions: { type: String }
}, { _id: false });

const TaskFileSchema = new Schema<TaskFile>({
  id: { type: String, required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const TaskActivitySchema = new Schema<TaskActivity>({
  id: { type: String, required: true },
  action: { 
    type: String, 
    required: true, 
    enum: ['CREATED', 'ASSIGNED', 'VIEWED', 'IN_PROGRESS', 'SUBMITTED', 'REVIEWED', 'COMPLETED', 'CANCELLED']
  },
  performedBy: { type: String, required: true },
  performedByRole: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  comment: { type: String },
  metadata: { type: Schema.Types.Mixed }
}, { _id: false });

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  
  // Assignment details
  assignedBy: { type: String, required: true, index: true },
  assignedByName: { type: String, required: true },
  assignedTo: { type: String, required: true, index: true },
  assignedToName: { type: String, required: true },
  assignedToRole: { type: String, required: true },
  
  // Status management
  status: { 
    type: String, 
    required: true, 
    enum: ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  priority: { 
    type: String, 
    required: true, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  
  // Form and responses
  formData: { type: TaskFormSchema, required: true },
  employeeResponse: { type: Schema.Types.Mixed }, // Flexible structure for responses
  
  // File attachments
  attachments: [TaskFileSchema],
  responseFiles: [TaskFileSchema],
  
  // Activity tracking
  activities: [TaskActivitySchema],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  completedAt: { type: Date },
  dueDate: { type: Date },
  
  // Additional metadata
  category: { type: String, index: true },
  tags: [{ type: String, index: true }],
  estimatedHours: { type: Number },
  actualHours: { type: Number }
}, {
  timestamps: true,
  collection: 'tasks'
});

// Indexes for performance
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ assignedBy: 1, status: 1 });
TaskSchema.index({ status: 1, createdAt: -1 });
TaskSchema.index({ assignedToRole: 1, status: 1 });
TaskSchema.index({ tags: 1 });

// Pre-save middleware
TaskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Add activity based on status change
  if (this.isModified('status')) {
    const oldStatus = this.getChanges().$set?.status || this.status;
    const newStatus = this.status;
    
    // Add appropriate activity
    let action: any;
    switch (newStatus) {
      case 'IN_PROGRESS':
        action = 'IN_PROGRESS';
        break;
      case 'SUBMITTED':
        action = 'SUBMITTED';
        this.submittedAt = new Date();
        break;
      case 'COMPLETED':
        action = 'COMPLETED';
        this.completedAt = new Date();
        break;
      case 'CANCELLED':
        action = 'CANCELLED';
        break;
      default:
        action = 'UPDATED';
    }
    
    this.activities.push({
      id: new Date().getTime().toString(),
      action,
      performedBy: this.assignedTo, // This will be updated in the API
      performedByRole: this.assignedToRole,
      timestamp: new Date(),
      comment: `Status changed to ${newStatus}`
    });
  }
  
  next();
});

// Export the model
export const Task = models.Task || model<ITask>('Task', TaskSchema);

// JSON Schema validation for MongoDB
export const TaskJsonSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['title', 'description', 'assignedBy', 'assignedByName', 'assignedTo', 'assignedToName', 'assignedToRole', 'status', 'priority', 'formData'],
    properties: {
      title: {
        bsonType: 'string',
        description: 'Task title',
        minLength: 1,
        maxLength: 200
      },
      description: {
        bsonType: 'string',
        description: 'Task description',
        minLength: 1,
        maxLength: 2000
      },
      assignedBy: {
        bsonType: 'string',
        description: 'ID of the user who assigned the task'
      },
      assignedByName: {
        bsonType: 'string',
        description: 'Name of the user who assigned the task'
      },
      assignedTo: {
        bsonType: 'string',
        description: 'ID of the user the task is assigned to'
      },
      assignedToName: {
        bsonType: 'string',
        description: 'Name of the user the task is assigned to'
      },
      assignedToRole: {
        bsonType: 'string',
        description: 'Role of the user the task is assigned to',
        enum: ['SUPER_ADMIN', 'ADMIN', 'GENERAL_MANAGER', 'PROGRAM_MANAGER', 'PROJECT_COORDINATOR', 'HR', 'FINANCE', 'PROCUREMENT', 'STOREKEEPER', 'ME_OFFICER', 'FIELD_OFFICER', 'ACCOUNTANT', 'USER']
      },
      status: {
        bsonType: 'string',
        description: 'Current status of the task',
        enum: ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'CANCELLED']
      },
      priority: {
        bsonType: 'string',
        description: 'Priority level of the task',
        enum: ['low', 'medium', 'high', 'urgent']
      },
      formData: {
        bsonType: 'object',
        required: ['title', 'description', 'fields'],
        properties: {
          title: { bsonType: 'string', minLength: 1 },
          description: { bsonType: 'string', minLength: 1 },
          fields: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              required: ['id', 'type', 'label'],
              properties: {
                id: { bsonType: 'string' },
                type: { bsonType: 'string', enum: ['text', 'textarea', 'number', 'email', 'date', 'select', 'checkbox', 'radio', 'file'] },
                label: { bsonType: 'string' },
                required: { bsonType: 'bool' }
              }
            }
          }
        }
      },
      attachments: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['id', 'filename', 'url', 'uploadedBy'],
          properties: {
            id: { bsonType: 'string' },
            filename: { bsonType: 'string' },
            url: { bsonType: 'string' },
            uploadedBy: { bsonType: 'string' }
          }
        }
      },
      responseFiles: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['id', 'filename', 'url', 'uploadedBy'],
          properties: {
            id: { bsonType: 'string' },
            filename: { bsonType: 'string' },
            url: { bsonType: 'string' },
            uploadedBy: { bsonType: 'string' }
          }
        }
      },
      activities: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['id', 'action', 'performedBy', 'performedByRole', 'timestamp'],
          properties: {
            id: { bsonType: 'string' },
            action: { bsonType: 'string', enum: ['CREATED', 'ASSIGNED', 'VIEWED', 'IN_PROGRESS', 'SUBMITTED', 'REVIEWED', 'COMPLETED', 'CANCELLED'] },
            performedBy: { bsonType: 'string' },
            performedByRole: { bsonType: 'string' },
            timestamp: { bsonType: 'date' }
          }
        }
      },
      category: { bsonType: 'string' },
      tags: {
        bsonType: 'array',
        items: { bsonType: 'string' }
      },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
      submittedAt: { bsonType: 'date' },
      completedAt: { bsonType: 'date' },
      dueDate: { bsonType: 'date' }
    }
  }
};
