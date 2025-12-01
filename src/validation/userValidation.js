const Joi = require('joi');
const mongoose = require('mongoose');

/**
 * Advanced User Validation Schemas
 * Features: Comprehensive validation, custom rules, security checks
 */

// Custom Joi validators
const customValidators = {
  // Password strength validator
  strongPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'Password is required'
    }),
  
  // Email validator with additional checks
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .custom((value, helpers) => {
      // Block common disposable email domains
      const disposableDomains = [
        '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
        'tempmail.org', 'throwaway.email', 'yopmail.com'
      ];
      
      const domain = value.split('@')[1]?.toLowerCase();
      if (disposableDomains.includes(domain)) {
        return helpers.error('email.disposable');
      }
      
      // Check for suspicious patterns
      if (value.includes('+') || value.includes('.')) {
        // Allow but log for potential abuse
        console.warn(`Suspicious email pattern detected: ${value}`);
      }
      
      return value;
    })
    .messages({
      'string.email': 'Please provide a valid email address',
      'email.disposable': 'Disposable email addresses are not allowed'
    }),
  
  // Phone number validator
  phone: Joi.string()
    .pattern(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
  
  // MongoDB ObjectId validator
  objectId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('objectId.invalid');
      }
      return value;
    })
    .messages({
      'objectId.invalid': 'Invalid ID format'
    }),
  
  // Role validator
  role: Joi.string()
    .valid('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE', 'VOLUNTEER', 'DONOR')
    .default('VOLUNTEER')
    .messages({
      'any.only': 'Invalid role specified'
    }),
  
  // Address validator
  address: Joi.object({
    street: Joi.string().max(100).optional(),
    city: Joi.string().max(50).optional(),
    state: Joi.string().max(50).optional(),
    zipCode: Joi.string().max(20).optional(),
    country: Joi.string().max(50).optional(),
    coordinates: Joi.object({
      type: Joi.string().valid('Point').default('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2).optional()
    }).optional()
  }).optional(),
  
  // Preferences validator
  preferences: Joi.object({
    language: Joi.string().valid('en', 'ar', 'fr', 'es').default('en'),
    timezone: Joi.string().default('UTC'),
    notifications: Joi.object({
      email: Joi.boolean().default(true),
      sms: Joi.boolean().default(false),
      push: Joi.boolean().default(true)
    }).default(),
    theme: Joi.string().valid('light', 'dark', 'auto').default('light')
  }).optional()
};

// Validation schemas
const userValidation = {
  // Create user validation
  createUser: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s'-]+$/)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters',
        'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes',
        'any.required': 'Name is required'
      }),
    
    email: customValidators.email.required(),
    password: customValidators.strongPassword,
    role: customValidators.role,
    phone: customValidators.phone,
    address: customValidators.address,
    preferences: customValidators.preferences
  }),
  
  // Update user validation
  updateUser: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s'-]+$/)
      .optional(),
    
    phone: customValidators.phone,
    address: customValidators.address,
    preferences: customValidators.preferences,
    role: customValidators.role.when(Joi.ref('$userRole'), {
      is: 'ADMIN',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),
    
    isActive: Joi.boolean().when(Joi.ref('$userRole'), {
      is: 'ADMIN',
      then: Joi.optional(),
      otherwise: Joi.forbidden()
    }),
    
    permissions: Joi.array()
      .items(Joi.string().valid(
        'user.create', 'user.read', 'user.update', 'user.delete',
        'project.create', 'project.read', 'project.update', 'project.delete',
        'donation.create', 'donation.read', 'donation.update', 'donation.process',
        'task.create', 'task.read', 'task.update', 'task.delete', 'task.assign',
        'analytics.view', 'system.admin', 'reports.generate'
      ))
      .when(Joi.ref('$userRole'), {
        is: 'ADMIN',
        then: Joi.optional(),
        otherwise: Joi.forbidden()
      })
  }).min(1),
  
  // Login validation
  login: Joi.object({
    email: customValidators.email.required(),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    }),
    rememberMe: Joi.boolean().default(false)
  }),
  
  // Password change validation
  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required'
    }),
    newPassword: customValidators.strongPassword,
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
      'any.only': 'Password confirmation does not match',
      'any.required': 'Password confirmation is required'
    })
  }),
  
  // Password reset validation
  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Reset token is required'
    }),
    newPassword: customValidators.strongPassword
  }),
  
  // Email verification validation
  verifyEmail: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Verification token is required'
    })
  }),
  
  // Bulk operations validation
  bulkOperation: Joi.object({
    operation: Joi.string()
      .valid('activate', 'deactivate', 'delete', 'updateRole')
      .required()
      .messages({
        'any.only': 'Invalid operation. Must be one of: activate, deactivate, delete, updateRole',
        'any.required': 'Operation is required'
      }),
    
    userIds: Joi.array()
      .items(customValidators.objectId)
      .min(1)
      .max(100)
      .required()
      .messages({
        'array.min': 'At least one user ID is required',
        'array.max': 'Cannot process more than 100 users at once',
        'any.required': 'User IDs array is required'
      }),
    
    data: Joi.when('operation', {
      is: 'updateRole',
      then: Joi.object({
        role: customValidators.role.required()
      }).required(),
      otherwise: Joi.optional()
    })
  }),
  
  // Search and filter validation
  getUsers: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    fields: Joi.string().optional(),
    search: Joi.string().max(100).optional(),
    role: Joi.string().valid(...['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE', 'VOLUNTEER', 'DONOR']).optional(),
    isActive: Joi.boolean().optional(),
    isEmailVerified: Joi.boolean().optional(),
    'address.country': Joi.string().optional(),
    'preferences.language': Joi.string().valid('en', 'ar', 'fr', 'es').optional()
  }),
  
  // Session management validation
  addSession: Joi.object({
    sessionId: Joi.string().required(),
    device: Joi.string().max(100).required(),
    browser: Joi.string().max(100).required(),
    ip: Joi.string().ip().required(),
    location: Joi.string().max(100).optional()
  }),
  
  removeSession: Joi.object({
    sessionId: Joi.string().required()
  }),
  
  // Activity log validation
  addActivityLog: Joi.object({
    action: Joi.string().max(50).required(),
    description: Joi.string().max(500).required(),
    ip: Joi.string().ip().optional(),
    userAgent: Joi.string().max(500).optional()
  })
};

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
      context: {
        userRole: req.user?.role,
        userId: req.user?.id
      }
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }
    
    // Replace the request data with validated data
    req[source] = value;
    next();
  };
};

// Custom validation rules
const customRules = {
  // Check if user exists
  userExists: async (userId) => {
    const User = require('../models/enhancedUser');
    const user = await User.findById(userId);
    return !!user;
  },
  
  // Check if email is available
  emailAvailable: async (email, excludeUserId = null) => {
    const User = require('../models/enhancedUser');
    const query = { email, isDeleted: { $ne: true } };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    const user = await User.findOne(query);
    return !user;
  },
  
  // Validate role hierarchy
  canAssignRole: (assignerRole, targetRole) => {
    const roleHierarchy = {
      'SUPER_ADMIN': ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE', 'VOLUNTEER', 'DONOR'],
      'ADMIN': ['MANAGER', 'SUPERVISOR', 'EMPLOYEE', 'VOLUNTEER', 'DONOR'],
      'MANAGER': ['SUPERVISOR', 'EMPLOYEE', 'VOLUNTEER', 'DONOR'],
      'SUPERVISOR': ['EMPLOYEE', 'VOLUNTEER', 'DONOR'],
      'EMPLOYEE': ['VOLUNTEER', 'DONOR'],
      'VOLUNTEER': ['DONOR'],
      'DONOR': []
    };
    
    return roleHierarchy[assignerRole]?.includes(targetRole) || false;
  }
};

module.exports = {
  userValidation,
  validate,
  customValidators,
  customRules
};
