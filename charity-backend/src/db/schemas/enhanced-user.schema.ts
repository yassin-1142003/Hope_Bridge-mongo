import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Role } from "../../common/enums/role.enum";

export type UserDocument = HydratedDocument<EnhancedUser>;

@Schema({ 
  timestamps: true,
  collection: "users",
  toJSON: {
    transform: function(doc: any, ret: any) {
      // Remove sensitive fields that might not exist
      if (ret.passwordHash) delete ret.passwordHash;
      if (ret.passwordResetToken) delete ret.passwordResetToken;
      if (ret.passwordResetExpires) delete ret.passwordResetExpires;
      if (ret.emailVerificationToken) delete ret.emailVerificationToken;
      if (ret.emailVerificationExpires) delete ret.emailVerificationExpires;
      if (ret.twoFactorSecret) delete ret.twoFactorSecret;
      if (ret.loginAttempts) delete ret.loginAttempts;
      if (ret.lockUntil) delete ret.lockUntil;
      if (ret.__v) delete ret.__v;
      return ret;
    }
  }
})
export class EnhancedUser {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  })
  email!: string;

  @Prop({ required: true, minlength: 8 })
  passwordHash!: string;

  @Prop({ type: String, enum: Role, default: Role.USER, index: true })
  role!: Role;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ default: false, index: true })
  emailVerified!: boolean;

  // Profile Information
  @Prop({ trim: true, maxlength: 20 })
  phone?: string;

  @Prop({ trim: true, maxlength: 200 })
  address?: string;

  @Prop({ trim: true, maxlength: 100 })
  avatar?: string;

  @Prop({ trim: true, maxlength: 50 })
  city?: string;

  @Prop({ trim: true, maxlength: 50 })
  country?: string;

  @Prop({ type: Number, min: -90, max: 90 })
  latitude?: number;

  @Prop({ type: Number, min: -180, max: 180 })
  longitude?: number;

  // Security Features
  @Prop({ default: Date.now })
  passwordChangedAt!: Date;

  @Prop({ type: String, select: false })
  passwordResetToken?: string;

  @Prop({ type: Date, select: false })
  passwordResetExpires?: Date;

  @Prop({ type: String, select: false })
  emailVerificationToken?: string;

  @Prop({ type: Date, select: false })
  emailVerificationExpires?: Date;

  @Prop({ default: false, select: false })
  twoFactorEnabled!: boolean;

  @Prop({ type: String, select: false })
  twoFactorSecret?: string;

  @Prop({ type: [String], select: false })
  backupCodes?: string[];

  @Prop({ default: 0, select: false })
  loginAttempts!: number;

  @Prop({ type: Date, select: false })
  lockUntil?: Date;

  // Activity Tracking
  @Prop({ default: Date.now, index: true })
  lastLoginAt?: Date;

  @Prop({ type: String })
  lastLoginIP?: string;

  @Prop({ type: String })
  lastLoginUserAgent?: string;

  @Prop({ type: Number, default: 0 })
  loginCount!: number;

  // Preferences
  @Prop({ 
    type: String, 
    enum: ['en', 'ar', 'fr', 'es'], 
    default: 'en' 
  })
  preferredLanguage!: string;

  @Prop({ 
    type: String, 
    enum: ['light', 'dark', 'auto'], 
    default: 'light' 
  })
  theme!: string;

  @Prop({ 
    type: Boolean, 
    default: true 
  })
  emailNotifications!: boolean;

  @Prop({ 
    type: Boolean, 
    default: false 
  })
  smsNotifications!: boolean;

  // Soft Delete
  @Prop({ default: false, select: false })
  isDeleted!: boolean;

  @Prop({ type: Date, select: false })
  deletedAt?: Date;

  @Prop({ type: String, select: false })
  deletedBy?: string;

  // Audit Trail
  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: String })
  updatedBy?: string;

  // Session Management
  @Prop({ 
    type: [{
      sessionId: String,
      device: String,
      browser: String,
      ip: String,
      location: String,
      lastActivity: Date,
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  })
  activeSessions!: Array<{
    sessionId: string;
    device: string;
    browser: string;
    ip: string;
    location: string;
    lastActivity: Date;
    createdAt: Date;
  }>;

  // Activity Log
  @Prop({ 
    type: [{
      action: String,
      description: String,
      ip: String,
      userAgent: String,
      timestamp: { type: Date, default: Date.now }
    }],
    default: []
  })
  activityLog!: Array<{
    action: string;
    description: string;
    ip: string;
    userAgent: string;
    timestamp: Date;
  }>;
}

export const EnhancedUserSchema = SchemaFactory.createForClass(EnhancedUser);
export type EnhancedUserDocument = HydratedDocument<EnhancedUser>;

// Performance Indexes
EnhancedUserSchema.index({ email: 1 }, { unique: true });
EnhancedUserSchema.index({ role: 1, isActive: 1 });
EnhancedUserSchema.index({ lastLoginAt: -1 });
EnhancedUserSchema.index({ createdAt: -1 });
EnhancedUserSchema.index({ isActive: 1, emailVerified: 1 });
EnhancedUserSchema.index({ 'activeSessions.lastActivity': -1 });

// Text index for search functionality
EnhancedUserSchema.index({ 
  name: 'text', 
  email: 'text',
  bio: 'text',
  department: 'text',
  position: 'text'
});

// Virtual for account age
EnhancedUserSchema.virtual('accountAge').get(function(this: any) {
  return Math.floor((Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
EnhancedUserSchema.pre('save', function(this: any, next: any) {
  if (this.isModified('passwordHash')) {
    this.passwordChangedAt = new Date();
  }
  
  // Log account creation
  if (this.isNew) {
    this.activityLog.push({
      action: 'ACCOUNT_CREATED',
      description: 'User account was created',
      userId: this._id,
      ip: 'system',
      userAgent: 'system',
      timestamp: new Date()
    });
  }
  
  if (this.isModified() && !this.isNew) {
    this.activityLog.push({
      action: 'PROFILE_UPDATED',
      description: 'User profile was updated',
      ip: 'system',
      userAgent: 'system',
      timestamp: new Date()
    });
  }
  
  next();
});

// Pre-find middleware to exclude deleted documents
EnhancedUserSchema.pre(/^find/, function(this: any, next: any) {
  if (!this.getQuery().includeDeleted) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});
