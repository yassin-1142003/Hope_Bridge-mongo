const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const catchAsync = require('../utils/catchAsync');

/**
 * Enhanced User Schema with Production Optimizations
 * Features: Soft deletes, audit trails, role-based permissions, caching
 */
const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
    minlength: [2, 'Name must be at least 2 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s'-]+$/.test(v);
      },
      message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
    }
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email address'
    },
    index: true // Performance optimization for email lookups
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false, // Don't include password in queries by default
    validate: {
      validator: function(v) {
        // Password strength validation
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  
  // Role and Permissions
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE', 'VOLUNTEER', 'DONOR'],
    default: 'VOLUNTEER',
    index: true // Performance optimization for role-based queries
  },
  
  permissions: [{
    type: String,
    enum: [
      'user.create', 'user.read', 'user.update', 'user.delete',
      'project.create', 'project.read', 'project.update', 'project.delete',
      'donation.create', 'donation.read', 'donation.update', 'donation.process',
      'task.create', 'task.read', 'task.update', 'task.delete', 'task.assign',
      'analytics.view', 'system.admin', 'reports.generate'
    ]
  }],
  
  // Profile Information
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number, Number] // [longitude, latitude]
    }
  },
  
  avatar: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Avatar must be a valid image URL'
    }
  },
  
  // Status and Activity
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  
  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  
  lockUntil: {
    type: Date,
    select: false
  },
  
  // Security
  passwordChangedAt: {
    type: Date,
    default: Date.now
  },
  
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Two-Factor Authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  
  twoFactorSecret: String,
  backupCodes: [String],
  
  // Preferences
  preferences: {
    language: {
      type: String,
      enum: ['en', 'ar', 'fr', 'es'],
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },
  
  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false,
    select: false
  },
  
  deletedAt: {
    type: Date,
    select: false
  },
  
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    select: false
  },
  
  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Session Management
  activeSessions: [{
    sessionId: String,
    device: String,
    browser: String,
    ip: String,
    location: String,
    lastActivity: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Activity Tracking
  activityLog: [{
    action: String,
    description: String,
    ip: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'address.coordinates': '2dsphere' });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });
userSchema.index({ isDeleted: 1 });

// Virtuals
userSchema.virtual('fullName').get(function() {
  return this.name;
});

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost factor 12 for security
    this.password = await bcrypt.hash(this.password, 12);
    
    // Update passwordChangedAt
    this.passwordChangedAt = Date.now() - 1000; // -1s to ensure token is created after password change
    
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('save', function(next) {
  // Update activity log for significant changes
  if (this.isModified() && !this.isNew) {
    this.activityLog.push({
      action: 'PROFILE_UPDATED',
      description: 'User profile was updated',
      ip: this.ip || 'unknown',
      userAgent: this.userAgent || 'unknown'
    });
  }
  next();
});

// Instance methods
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  
  this.passwordResetToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

userSchema.methods.incrementLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

userSchema.methods.addActivityLog = function(action, description, ip, userAgent) {
  this.activityLog.push({
    action,
    description,
    ip,
    userAgent,
    timestamp: new Date()
  });
  
  // Keep only last 100 activities
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }
  
  return this.save();
};

userSchema.methods.addSession = function(sessionData) {
  this.activeSessions.push({
    ...sessionData,
    createdAt: new Date()
  });
  
  // Remove old sessions (keep only last 10)
  this.activeSessions.sort((a, b) => b.createdAt - a.createdAt);
  if (this.activeSessions.length > 10) {
    this.activeSessions = this.activeSessions.slice(0, 10);
  }
  
  return this.save();
};

userSchema.methods.removeSession = function(sessionId) {
  this.activeSessions = this.activeSessions.filter(
    session => session.sessionId !== sessionId
  );
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email, isDeleted: { $ne: true } });
};

userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true, isDeleted: { $ne: true } });
};

userSchema.statics.getActiveUsers = function() {
  return this.find({ 
    isActive: true, 
    isDeleted: { $ne: true },
    lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Active in last 30 days
  });
};

userSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $match: { isDeleted: { $ne: true } }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
        verified: { $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] } },
        byRole: {
          $push: {
            role: '$role',
            count: 1
          }
        }
      }
    }
  ]);
  
  return stats[0] || { total: 0, active: 0, verified: 0, byRole: [] };
};

// Query middleware
userSchema.pre(/^find/, function(next) {
  // Exclude deleted documents by default
  if (!this.getQuery().includeDeleted) {
    this.find({ isDeleted: { $ne: true } });
  }
  
  // Exclude sensitive fields
  this.select('-loginAttempts -lockUntil -passwordResetToken -twoFactorSecret');
  
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
