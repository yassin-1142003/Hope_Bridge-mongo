import { Schema, model, Document } from 'mongoose';
import DatabaseManager from '../index';

// Task Schema
const TaskSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned user is required']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: false
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'CANCELLED'],
    default: 'TODO'
  },
  category: {
    type: String,
    enum: ['DEVELOPMENT', 'DESIGN', 'MARKETING', 'ADMIN', 'FINANCE', 'OPERATIONS', 'OTHER'],
    default: 'OTHER'
  },
  tags: [{
    type: String,
    trim: true
  }],
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours must be positive']
  },
  actualHours: {
    type: Number,
    default: 0,
    min: [0, 'Actual hours must be positive']
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  dependencies: [{
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['BLOCKS', 'DEPENDS_ON'],
      required: true
    }
  }],
  progress: {
    type: Number,
    default: 0,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot exceed 100']
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Task User Schema (for task management users)
const TaskUserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'DESIGNER', 'VOLUNTEER'],
    default: 'VOLUNTEER'
  },
  department: {
    type: String,
    enum: ['DEVELOPMENT', 'DESIGN', 'MARKETING', 'ADMIN', 'FINANCE', 'OPERATIONS'],
    required: false
  },
  skills: [{
    type: String,
    trim: true
  }],
  availability: {
    type: String,
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'VOLUNTEER'],
    default: 'VOLUNTEER'
  },
  maxHours: {
    type: Number,
    default: 40,
    min: [0, 'Max hours must be positive']
  },
  currentWorkload: {
    type: Number,
    default: 0,
    min: [0, 'Current workload must be positive']
  },
  avatar: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Project Schema (for task management)
const TaskProjectSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'TaskUser',
    required: [true, 'Project manager is required']
  },
  team: [{
    type: Schema.Types.ObjectId,
    ref: 'TaskUser'
  }],
  status: {
    type: String,
    enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'],
    default: 'PLANNING'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  budget: {
    type: Number,
    min: [0, 'Budget must be positive']
  },
  tags: [{
    type: String,
    trim: true
  }],
  progress: {
    type: Number,
    default: 0,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot exceed 100']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Time Entry Schema
const TimeEntrySchema = new Schema({
  task: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Task is required']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'TaskUser',
    required: [true, 'User is required']
  },
  hours: {
    type: Number,
    required: [true, 'Hours are required'],
    min: [0.1, 'Hours must be at least 0.1']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  billable: {
    type: Boolean,
    default: true
  },
  hourlyRate: {
    type: Number,
    min: [0, 'Hourly rate must be positive']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Get database connection and create models
export const getTaskManagementModels = () => {
  const db = DatabaseManager.getInstance().getConnection('taskManagement');
  
  return {
    Task: db.model('Task', TaskSchema),
    TaskUser: db.model('TaskUser', TaskUserSchema),
    TaskProject: db.model('TaskProject', TaskProjectSchema),
    TimeEntry: db.model('TimeEntry', TimeEntrySchema)
  };
};

export interface ITask extends Document {
  title: string;
  description: string;
  assignedTo: any;
  createdBy: any;
  project?: any;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';
  category: 'DEVELOPMENT' | 'DESIGN' | 'MARKETING' | 'ADMIN' | 'FINANCE' | 'OPERATIONS' | 'OTHER';
  tags: string[];
  dueDate: Date;
  estimatedHours?: number;
  actualHours: number;
  attachments: any[];
  comments: any[];
  dependencies: any[];
  progress: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_LEAD' | 'DEVELOPER' | 'DESIGNER' | 'VOLUNTEER';
  department?: 'DEVELOPMENT' | 'DESIGN' | 'MARKETING' | 'ADMIN' | 'FINANCE' | 'OPERATIONS';
  skills: string[];
  availability: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'VOLUNTEER';
  maxHours: number;
  currentWorkload: number;
  avatar?: string;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskProject extends Document {
  name: string;
  description: string;
  manager: any;
  team: any[];
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  startDate: Date;
  endDate: Date;
  budget?: number;
  tags: string[];
  progress: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimeEntry extends Document {
  task: ITask;
  user: ITaskUser;
  hours: number;
  description: string;
  date: Date;
  billable: boolean;
  hourlyRate?: number;
  createdAt: Date;
  updatedAt: Date;
}
