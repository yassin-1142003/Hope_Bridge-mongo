import { Schema, model, Document } from 'mongoose';
import DatabaseManager from '../index';

// User Schema
const UserSchema = new Schema({
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
    enum: ['ADMIN', 'MANAGER', 'VOLUNTEER', 'DONOR'],
    default: 'VOLUNTEER'
  },
  phone: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
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

// Project Schema
const ProjectSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['EDUCATION', 'HEALTH', 'FOOD', 'SHELTER', 'EMERGENCY', 'OTHER'],
    required: [true, 'Project category is required']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [0, 'Target amount must be positive']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount must be positive']
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'AED'],
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED'],
    default: 'ACTIVE'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  images: [{
    type: String
  }],
  videos: [{
    type: String
  }],
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  coordinator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Coordinator is required']
  },
  volunteers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  donations: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    currency: String,
    date: {
      type: Date,
      default: Date.now
    },
    anonymous: {
      type: Boolean,
      default: false
    }
  }],
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

// Donation Schema
const DonationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be at least 1']
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'AED'],
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['CREDIT_CARD', 'BANK_TRANSFER', 'PAYPAL', 'CRYPTO'],
    required: [true, 'Payment method is required']
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters']
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

// Volunteer Schema
const VolunteerSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  skills: [{
    type: String
  }],
  availability: {
    type: String,
    enum: ['FULL_TIME', 'PART_TIME', 'WEEKENDS', 'FLEXIBLE'],
    default: 'FLEXIBLE'
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
    default: 'PENDING'
  },
  hoursCommitted: {
    type: Number,
    default: 0
  },
  hoursCompleted: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
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
export const getHopeBridgeModels = () => {
  const db = DatabaseManager.getInstance().getConnection('hopebridge');
  
  return {
    User: db.model('User', UserSchema),
    Project: db.model('Project', ProjectSchema),
    Donation: db.model('Donation', DonationSchema),
    Volunteer: db.model('Volunteer', VolunteerSchema)
  };
};

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'VOLUNTEER' | 'DONOR';
  phone?: string;
  address?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject extends Document {
  title: string;
  description: string;
  category: 'EDUCATION' | 'HEALTH' | 'FOOD' | 'SHELTER' | 'EMERGENCY' | 'OTHER';
  targetAmount: number;
  currentAmount: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'AED';
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PAUSED';
  startDate: Date;
  endDate: Date;
  images: string[];
  videos: string[];
  location: string;
  coordinator: IUser;
  volunteers: IUser[];
  donations: any[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDonation extends Document {
  user: IUser;
  project: IProject;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'AED';
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'PAYPAL' | 'CRYPTO';
  transactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  anonymous: boolean;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVolunteer extends Document {
  user: IUser;
  project: IProject;
  skills: string[];
  availability: 'FULL_TIME' | 'PART_TIME' | 'WEEKENDS' | 'FLEXIBLE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  hoursCommitted: number;
  hoursCompleted: number;
  startDate: Date;
  endDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
