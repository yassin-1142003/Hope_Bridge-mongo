import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type TaskDocument = HydratedDocument<Task>;

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  IN_REVIEW = "in_review",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  ON_HOLD = "on_hold",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
  CRITICAL = "critical",
}

export enum TaskCategory {
  DEVELOPMENT = "development",
  DESIGN = "design",
  MARKETING = "marketing",
  ADMIN = "admin",
  FINANCE = "finance",
  OPERATIONS = "operations",
  FUNDRAISING = "fundraising",
  VOLUNTEER_MANAGEMENT = "volunteer_management",
  CONTENT_CREATION = "content_creation",
  EVENT_PLANNING = "event_planning",
  COMMUNICATION = "communication",
  RESEARCH = "research",
  OTHER = "other",
}

@Schema({
  timestamps: true,
  collection: "tasks",
  toJSON: {
    transform: function(doc: any, ret: any) {
      // Remove optional fields that might not exist
      if (ret.__v) delete ret.__v;
      return ret;
    }
  }
})
export class Task {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  description!: string;

  @Prop({ 
    type: String, 
    enum: TaskStatus, 
    default: TaskStatus.TODO,
    index: true 
  })
  status!: TaskStatus;

  @Prop({ 
    type: String, 
    enum: TaskPriority, 
    default: TaskPriority.MEDIUM,
    index: true 
  })
  priority!: TaskPriority;

  @Prop({ 
    type: String, 
    enum: TaskCategory, 
    required: true,
    index: true 
  })
  category!: TaskCategory;

  // Assignment Information
  @Prop({ type: Types.ObjectId, ref: 'EnhancedUser', index: true })
  assignedTo?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EnhancedUser', index: true })
  createdBy!: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'EnhancedUser', default: [] })
  watchers!: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'EnhancedUser' })
  reviewedBy?: Types.ObjectId;

  // Project Association
  @Prop({ type: Types.ObjectId, ref: 'EnhancedProject', index: true })
  project?: Types.ObjectId;

  // Timeline
  @Prop({ type: Date, index: true })
  dueDate?: Date;

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: Date })
  reviewedAt?: Date;

  // Time Tracking
  @Prop({ type: Number, default: 0, min: 0 })
  estimatedHours!: number;

  @Prop({ type: Number, default: 0, min: 0 })
  actualHours!: number;

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  progressPercentage!: number;

  // Dependencies
  @Prop({ type: [Types.ObjectId], ref: 'Task', default: [] })
  dependencies!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Task', default: [] })
  blocks!: Types.ObjectId[];

  // Tags and Labels
  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: [String], default: [] })
  labels!: string[];

  // Skills Required
  @Prop({ type: [String], default: [] })
  requiredSkills!: string[];

  // Location (if applicable)
  @Prop({ type: Boolean, default: false })
  isLocationBased!: boolean;

  @Prop({ trim: true, maxlength: 200 })
  location?: string;

  @Prop({ type: Number, min: -90, max: 90 })
  latitude?: number;

  @Prop({ type: Number, min: -180, max: 180 })
  longitude?: number;

  // Volunteer Information (for volunteer tasks)
  @Prop({ type: Boolean, default: false })
  isVolunteerTask!: boolean;

  @Prop({ type: Number, default: 1, min: 1 })
  volunteerSlotsNeeded!: number;

  @Prop({ type: [Types.ObjectId], ref: 'EnhancedUser', default: [] })
  volunteerAssignees!: Types.ObjectId[];

  // Attachments and Resources
  @Prop({ type: [String], default: [] })
  attachments!: string[];

  @Prop({ type: [String], default: [] })
  resources!: string[];

  @Prop({ type: [String], default: [] })
  links!: string[];

  // Checklist
  @Prop({ 
    type: [{
      title: String,
      completed: { type: Boolean, default: false },
      completedBy: { type: Types.ObjectId, ref: 'EnhancedUser' },
      completedAt: Date,
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  })
  checklist!: Array<{
    title: string;
    completed: boolean;
    completedBy?: Types.ObjectId;
    completedAt?: Date;
    createdAt: Date;
  }>;

  // Comments and Discussion
  @Prop({ 
    type: [{
      content: String,
      author: { type: Types.ObjectId, ref: 'EnhancedUser', required: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: Date,
      isEdited: { type: Boolean, default: false },
      attachments: [String]
    }],
    default: []
  })
  comments!: Array<{
    content: string;
    author: Types.ObjectId;
    createdAt: Date;
    updatedAt?: Date;
    isEdited: boolean;
    attachments: string[];
  }>;

  // Time Entries
  @Prop({ 
    type: [{
      user: { type: Types.ObjectId, ref: 'EnhancedUser', required: true },
      hours: { type: Number, required: true, min: 0 },
      description: String,
      date: { type: Date, required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  })
  timeEntries!: Array<{
    user: Types.ObjectId;
    hours: number;
    description?: string;
    date: Date;
    createdAt: Date;
  }>;

  // Approval Workflow
  @Prop({ type: Boolean, default: false })
  requiresApproval!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'EnhancedUser' })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: String, trim: true, maxlength: 500 })
  approvalNotes?: string;

  // Recurrence
  @Prop({ type: Boolean, default: false })
  isRecurring!: boolean;

  @Prop({ type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] })
  recurringFrequency?: string;

  @Prop({ type: Date })
  nextOccurrence?: Date;

  @Prop({ type: Date })
  recurringEndDate?: Date;

  // Notifications
  @Prop({ type: Boolean, default: true })
  sendNotifications!: boolean;

  @Prop({ type: [String], default: [] })
  notificationRecipients!: string[];

  // Visibility and Access
  @Prop({ type: Boolean, default: true })
  isVisible!: boolean;

  @Prop({ type: [String], default: [] })
  visibleToRoles!: string[];

  @Prop({ type: [Types.ObjectId], ref: 'EnhancedUser', default: [] })
  visibleToUsers!: Types.ObjectId[];

  // Soft Delete
  @Prop({ default: false, select: false })
  isDeleted!: boolean;

  @Prop({ type: Date, select: false })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'EnhancedUser', select: false })
  deletedBy?: Types.ObjectId;

  // Activity Log
  @Prop({ 
    type: [{
      action: String,
      description: String,
      userId: { type: Types.ObjectId, ref: 'EnhancedUser', required: true },
      timestamp: { type: Date, default: Date.now },
      details: Object
    }],
    default: []
  })
  activityLog!: Array<{
    action: string;
    description: string;
    userId: Types.ObjectId;
    timestamp: Date;
    details?: any;
  }>;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Performance Indexes
TaskSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });
TaskSchema.index({ createdBy: 1, createdAt: -1 });
TaskSchema.index({ status: 1, priority: 1, dueDate: 1 });
TaskSchema.index({ category: 1, status: 1 });
TaskSchema.index({ project: 1, status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ startDate: 1 });
TaskSchema.index({ completedAt: -1 });
TaskSchema.index({ createdAt: -1 });
TaskSchema.index({ updatedAt: -1 });

// Compound indexes for common queries
TaskSchema.index({ status: 1, priority: 1, dueDate: 1 });
TaskSchema.index({ assignedTo: 1, status: 1, createdAt: -1 });
TaskSchema.index({ project: 1, status: 1, priority: 1 });
TaskSchema.index({ isVolunteerTask: 1, status: 1, dueDate: 1 });

// Geospatial index for location-based tasks
TaskSchema.index({ latitude: 1, longitude: 1 }, { sparse: true });

// Text index for search functionality
TaskSchema.index({ 
  title: 'text', 
  description: 'text',
  tags: 'text',
  labels: 'text',
  requiredSkills: 'text'
});

// Virtual for days until due
TaskSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue
TaskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return new Date() > new Date(this.dueDate) && this.status !== TaskStatus.COMPLETED;
});

// Virtual for completion percentage based on checklist
TaskSchema.virtual('checklistProgress').get(function() {
  if (this.checklist.length === 0) return 0;
  const completed = this.checklist.filter(item => item.completed).length;
  return (completed / this.checklist.length) * 100;
});

// Virtual for total time logged
TaskSchema.virtual('totalTimeLogged').get(function() {
  return this.timeEntries.reduce((total, entry) => total + entry.hours, 0);
});

// Virtual for volunteer slots filled
TaskSchema.virtual('volunteerSlotsFilled').get(function() {
  return this.volunteerAssignees.length;
});

// Virtual for volunteer slots available
TaskSchema.virtual('volunteerSlotsAvailable').get(function() {
  return this.volunteerSlotsNeeded - this.volunteerAssignees.length;
});

// Pre-save middleware
TaskSchema.pre('save', function(next) {
  // Update completedAt when status changes to completed
  if (this.isModified('status') && this.status === TaskStatus.COMPLETED && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Update reviewedAt when status changes to in_review
  if (this.isModified('status') && this.status === TaskStatus.IN_REVIEW && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }
  
  // Calculate progress based on checklist
  if (this.isModified('checklist')) {
    const checklist = this.checklist || [];
    const completed = checklist.filter(item => item.completed).length;
    this.progressPercentage = checklist.length > 0 ? (completed / checklist.length) * 100 : 0;
  }
  
  // Update next occurrence for recurring tasks
  if (this.isModified('recurringFrequency') && this.isRecurring) {
    const now = new Date();
    switch (this.recurringFrequency) {
      case 'daily':
        this.nextOccurrence = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        this.nextOccurrence = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        this.nextOccurrence = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        break;
      case 'yearly':
        this.nextOccurrence = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        break;
    }
  }
  
  next();
});

// Pre-find middleware to exclude deleted documents
TaskSchema.pre(/^find/, function(this: any, next: any) {
  if (!this.getQuery().includeDeleted) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});
