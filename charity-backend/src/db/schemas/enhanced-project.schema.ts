import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export enum ProjectStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  COMPLETED = "completed",
  SUSPENDED = "suspended",
  CANCELLED = "cancelled",
}

export enum ProjectCategory {
  EDUCATION = "education",
  HEALTH = "health",
  FOOD = "food",
  SHELTER = "shelter",
  WATER = "water",
  EMERGENCY = "emergency",
  INFRASTRUCTURE = "infrastructure",
  AGRICULTURE = "agriculture",
  TECHNOLOGY = "technology",
  OTHER = "other",
}

@Schema({ _id: false })
export class ProjectContent {
  @Prop({ required: true, trim: true, maxlength: 2 })
  language_code!: string;

  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({ required: true, trim: true, maxlength: 500 })
  description!: string;

  @Prop({ required: true, trim: true })
  content!: string;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ type: [String], default: [] })
  videos!: string[];

  @Prop({ type: [String], default: [] })
  documents!: string[];

  @Prop({ trim: true, maxlength: 100 })
  tags?: string[];

  @Prop({ trim: true })
  metaDescription?: string;

  @Prop({ trim: true })
  metaKeywords?: string;
}

export const ProjectContentSchema = SchemaFactory.createForClass(ProjectContent);

@Schema({
  timestamps: true,
  collection: "projects",
  toJSON: {
    transform: function(doc: any, ret: any) {
      // Remove optional fields that might not exist
      if (ret.__v) delete ret.__v;
      return ret;
    }
  }
})
export class EnhancedProject {
  @Prop({ required: true, trim: true })
  bannerPhotoUrl!: string;

  @Prop({ type: [String], default: [] })
  imageGallery!: string[];

  @Prop({ type: [String], default: [] })
  videoGallery!: string[];

  @Prop({ type: [ProjectContentSchema], required: true })
  contents!: ProjectContent[];

  @Prop({ 
    type: String, 
    enum: ProjectStatus, 
    default: ProjectStatus.DRAFT,
    index: true 
  })
  status!: ProjectStatus;

  @Prop({ 
    type: String, 
    enum: ProjectCategory, 
    required: true,
    index: true 
  })
  category!: ProjectCategory;

  @Prop({ 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 100,
    unique: true,
    index: true 
  })
  slug!: string;

  // Financial Information
  @Prop({ type: Number, required: true, min: 0 })
  targetAmount!: number;

  @Prop({ type: Number, default: 0, min: 0 })
  currentAmount!: number;

  @Prop({ 
    type: String, 
    enum: ['USD', 'EUR', 'GBP', 'AED', 'SAR'], 
    default: 'USD' 
  })
  currency!: string;

  @Prop({ type: Number, default: 0, min: 0 })
  donorCount!: number;

  // Timeline
  @Prop({ type: Date, required: true })
  startDate!: Date;

  @Prop({ type: Date, required: true })
  endDate!: Date;

  @Prop({ type: Date })
  actualEndDate?: Date;

  // Location Information
  @Prop({ trim: true, maxlength: 200 })
  location!: string;

  @Prop({ trim: true, maxlength: 100 })
  city!: string;

  @Prop({ trim: true, maxlength: 100 })
  country!: string;

  @Prop({ type: Number, min: -90, max: 90 })
  latitude?: number;

  @Prop({ type: Number, min: -180, max: 180 })
  longitude?: number;

  // Team Information
  @Prop({ type: Types.ObjectId, ref: 'EnhancedUser', index: true })
  projectManager?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'EnhancedUser', default: [] })
  teamMembers!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'EnhancedUser', default: [] })
  volunteers!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'EnhancedUser', default: [] })
  donors!: Types.ObjectId[];

  // Project Metrics
  @Prop({ type: Number, default: 0, min: 0 })
  beneficiariesCount!: number;

  @Prop({ type: Number, default: 0, min: 0 })
  volunteerHours!: number;

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  completionPercentage!: number;

  // Priority and Visibility
  @Prop({ 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium',
    index: true 
  })
  priority!: string;

  @Prop({ default: true, index: true })
  isFeatured!: boolean;

  @Prop({ default: true, index: true })
  isVisible!: boolean;

  // Tags and Categories
  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: [String], default: [] })
  skills!: string[];

  // External Links
  @Prop({ type: [String], default: [] })
  externalLinks!: string[];

  @Prop({ type: String, trim: true })
  websiteUrl?: string;

  @Prop({ type: String, trim: true })
  socialMediaUrl?: string;

  // Contact Information
  @Prop({ trim: true, maxlength: 100 })
  contactEmail?: string;

  @Prop({ trim: true, maxlength: 20 })
  contactPhone?: string;

  // Documents and Resources
  @Prop({ type: [String], default: [] })
  documents!: string[];

  @Prop({ type: [String], default: [] })
  reports!: string[];

  @Prop({ type: [String], default: [] })
  certificates!: string[];

  // Audit Trail
  @Prop({ type: Types.ObjectId, ref: 'EnhancedUser' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EnhancedUser' })
  updatedBy?: Types.ObjectId;

  @Prop({ type: String })
  approvedBy?: string;

  @Prop({ type: Date })
  approvedAt?: Date;

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
      userId: { type: Types.ObjectId, ref: 'EnhancedUser' },
      timestamp: { type: Date, default: Date.now }
    }],
    default: []
  })
  activityLog!: Array<{
    action: string;
    description: string;
    userId: Types.ObjectId;
    timestamp: Date;
  }>;
}

export const EnhancedProjectSchema = SchemaFactory.createForClass(EnhancedProject);
export type EnhancedProjectDocument = HydratedDocument<EnhancedProject>;

// Performance Indexes
EnhancedProjectSchema.index({ slug: 1 }, { unique: true });
EnhancedProjectSchema.index({ status: 1, createdAt: -1 });
EnhancedProjectSchema.index({ category: 1, status: 1 });
EnhancedProjectSchema.index({ isFeatured: 1, status: 1 });
EnhancedProjectSchema.index({ isVisible: 1, status: 1 });
EnhancedProjectSchema.index({ priority: 1, status: 1 });
EnhancedProjectSchema.index({ projectManager: 1 });
EnhancedProjectSchema.index({ teamMembers: 1 });
EnhancedProjectSchema.index({ volunteers: 1 });
EnhancedProjectSchema.index({ donors: 1 });
EnhancedProjectSchema.index({ startDate: -1 });
EnhancedProjectSchema.index({ endDate: -1 });
EnhancedProjectSchema.index({ createdAt: -1 });
EnhancedProjectSchema.index({ updatedAt: -1 });

// Geospatial index for location-based queries
EnhancedProjectSchema.index({ latitude: 1, longitude: 1 }, { sparse: true });

// Compound indexes for common queries
EnhancedProjectSchema.index({ category: 1, status: 1, isFeatured: 1 });
EnhancedProjectSchema.index({ status: 1, isVisible: 1, createdAt: -1 });
EnhancedProjectSchema.index({ priority: 1, status: 1, createdAt: -1 });
EnhancedProjectSchema.index({ city: 1, country: 1, status: 1 });

// Text index for search functionality
EnhancedProjectSchema.index({ 
  'contents.title': 'text', 
  'contents.description': 'text',
  'contents.content': 'text',
  location: 'text',
  city: 'text',
  country: 'text',
  tags: 'text'
});

// Financial indexes
EnhancedProjectSchema.index({ targetAmount: -1 });
EnhancedProjectSchema.index({ currentAmount: -1 });
EnhancedProjectSchema.index({ donorCount: -1 });

// Virtual for progress percentage
EnhancedProjectSchema.virtual('progressPercentage').get(function(this: any) {
  if (!this.targetAmount || this.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
});

// Virtual for days remaining
EnhancedProjectSchema.virtual('daysRemaining').get(function(this: any) {
  const today = new Date();
  const endDate = new Date(this.endDate);
  const diffTime = endDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue
EnhancedProjectSchema.virtual('isOverdue').get(function(this: any) {
  return new Date() > new Date(this.endDate) && this.status !== ProjectStatus.COMPLETED;
});

// Virtual for funding status
EnhancedProjectSchema.virtual('fundingStatus').get(function(this: any) {
  if (!this.targetAmount || this.targetAmount <= 0) return 'just_started';
  const percentage = Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
  if (percentage >= 100) return 'completed';
  if (percentage >= 75) return 'nearly_complete';
  if (percentage >= 50) return 'half_funded';
  if (percentage >= 25) return 'quarter_funded';
  return 'just_started';
});

// Pre-save middleware
EnhancedProjectSchema.pre('save', function(this: any, next: any) {
  // Update completion percentage based on progress
  if (this.isModified('currentAmount') || this.isModified('targetAmount')) {
    if (!this.targetAmount || this.targetAmount <= 0) {
      this.completionPercentage = 0;
    } else {
      this.completionPercentage = Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
    }
  }
  
  // Auto-update status based on dates
  if (this.isModified('endDate') || this.isModified('startDate')) {
    const now = new Date();
    if (now < this.startDate && this.status === ProjectStatus.ACTIVE) {
      this.status = ProjectStatus.DRAFT;
    } else if (now > this.endDate && this.status === ProjectStatus.ACTIVE) {
      this.status = ProjectStatus.COMPLETED;
      this.actualEndDate = now;
    }
  }
  
  next();
});

// Pre-find middleware to exclude deleted documents
EnhancedProjectSchema.pre(/^find/, function(this: any, next: any) {
  if (!this.getQuery().includeDeleted) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});
