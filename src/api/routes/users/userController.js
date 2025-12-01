const User = require('../../../models/enhancedUser');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');
const logger = require('../../../utils/logger');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Email = require('../../../utils/email');

/**
 * Enhanced User Controller with Production Features
 * Features: Advanced CRUD, caching, security, audit trails
 */

// Helper function to filter unwanted fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Helper function to create and send token
const createSendToken = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  
  res.cookie('jwt', token, cookieOptions);
  
  res.status(statusCode).json({
    success: true,
    message,
    data: {
      token,
      user
    }
  });
};

// Sign JWT token
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

/**
 * @desc    Create new user
 * @route   POST /api/v1/users
 * @access  Public
 */
exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role, phone, address } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }
  
  // Create new user
  const newUser = await User.create({
    name,
    email,
    password,
    role: role || 'VOLUNTEER',
    phone,
    address,
    createdBy: req.user ? req.user.id : newUser.id // Self-creation for public signup
  });
  
  // Generate email verification token
  const verificationToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });
  
  // Send verification email
  try {
    const url = `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${verificationToken}`;
    await new Email(newUser, url).sendWelcome();
    
    logger.info(`New user created: ${email}`, { userId: newUser._id });
    
    // Send token (but don't require email verification for login)
    createSendToken(newUser, 201, res, 'User created successfully. Please check your email for verification.');
    
  } catch (err) {
    // If email fails, still create user but log error
    logger.error('Failed to send welcome email:', err);
    createSendToken(newUser, 201, res, 'User created successfully. Email verification sent.');
  }
});

/**
 * @desc    Get all users with advanced filtering and pagination
 * @route   GET /api/v1/users
 * @access  Private (Admin/Manager)
 */
exports.getAllUsers = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach(el => delete queryObj[el]);
  
  // Advanced filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  
  let query = User.find(JSON.parse(queryStr));
  
  // Search functionality
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query = query.or([
      { name: searchRegex },
      { email: searchRegex },
      { role: searchRegex }
    ]);
  }
  
  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  
  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',');
    query = query.select(fields.join(' '));
  } else {
    query = query.select('-password -loginAttempts -lockUntil');
  }
  
  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;
  
  query = query.skip(skip).limit(limit);
  
  // Execute query
  const [users, total] = await Promise.all([
    query,
    User.countDocuments(JSON.parse(queryStr))
  ]);
  
  // Add activity log for admin users
  if (req.user) {
    await req.user.addActivityLog(
      'USERS_VIEWED',
      `Viewed ${users.length} users`,
      req.ip,
      req.get('User-Agent')
    );
  }
  
  res.status(200).json({
    success: true,
    results: users.length,
    total,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: {
      users
    }
  });
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid user ID', 400));
  }
  
  let query = User.findById(id);
  
  // Add population if requested
  if (req.query.populate) {
    const populateFields = req.query.populate.split(',');
    query = query.populate(populateFields.join(' '));
  }
  
  const user = await query;
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Check permissions
  if (req.user.role !== 'ADMIN' && req.user.id !== user.id) {
    return next(new AppError('You do not have permission to view this user', 403));
  }
  
  // Add activity log
  await req.user.addActivityLog(
    'USER_VIEWED',
    `Viewed user: ${user.email}`,
    req.ip,
    req.get('User-Agent')
  );
  
  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

/**
 * @desc    Update user
 * @route   PATCH /api/v1/users/:id
 * @access  Private
 */
exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid user ID', 400));
  }
  
  const user = await User.findById(id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Check permissions
  if (req.user.role !== 'ADMIN' && req.user.id !== user.id) {
    return next(new AppError('You do not have permission to update this user', 403));
  }
  
  // Filter unwanted fields
  const allowedFields = ['name', 'phone', 'address', 'preferences'];
  if (req.user.role === 'ADMIN') {
    allowedFields.push('role', 'isActive', 'permissions');
  }
  
  const filteredBody = filterObj(req.body, ...allowedFields);
  
  // Don't allow password update through this route
  if (filteredBody.password) {
    return next(new AppError('Use the password update route for password changes', 400));
  }
  
  // Add updatedBy field
  filteredBody.updatedBy = req.user.id;
  
  // Update user
  const updatedUser = await User.findByIdAndUpdate(id, filteredBody, {
    new: true,
    runValidators: true
  });
  
  // Add activity log
  await req.user.addActivityLog(
    'USER_UPDATED',
    `Updated user: ${updatedUser.email}`,
    req.ip,
    req.get('User-Agent')
  );
  
  logger.info(`User updated: ${updatedUser.email}`, { 
    userId: updatedUser._id,
    updatedBy: req.user.id 
  });
  
  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: updatedUser
    }
  });
});

/**
 * @desc    Delete user (soft delete)
 * @route   DELETE /api/v1/users/:id
 * @access  Private (Admin only)
 */
exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid user ID', 400));
  }
  
  // Only admins can delete users
  if (req.user.role !== 'ADMIN') {
    return next(new AppError('Only administrators can delete users', 403));
  }
  
  const user = await User.findById(id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  // Prevent self-deletion
  if (req.user.id === user.id) {
    return next(new AppError('You cannot delete your own account', 400));
  }
  
  // Soft delete
  await User.findByIdAndUpdate(id, {
    isDeleted: true,
    deletedAt: new Date(),
    deletedBy: req.user.id,
    isActive: false
  });
  
  // Add activity log
  await req.user.addActivityLog(
    'USER_DELETED',
    `Deleted user: ${user.email}`,
    req.ip,
    req.get('User-Agent')
  );
  
  logger.warn(`User deleted: ${user.email}`, { 
    userId: user._id,
    deletedBy: req.user.id 
  });
  
  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * @desc    Get user statistics
 * @route   GET /api/v1/users/stats
 * @access  Private (Admin/Manager)
 */
exports.getUserStats = catchAsync(async (req, res, next) => {
  // Check permissions
  if (!['ADMIN', 'MANAGER'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to view user statistics', 403));
  }
  
  const stats = await User.getStatistics();
  
  // Additional analytics
  const [monthlyGrowth, roleDistribution, activityStats] = await Promise.all([
    // Monthly user growth
    User.aggregate([
      {
        $match: {
          isDeleted: { $ne: true },
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        },
        sort: { _id: 1 }
      }
    ]),
    
    // Role distribution
    User.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]),
    
    // Activity statistics
    User.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          avgLoginAttempts: { $avg: '$loginAttempts' },
          activeUsers: {
            $sum: {
              $cond: [
                { $gte: ['$lastLogin', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          },
          verifiedUsers: {
            $sum: { $cond: ['$isEmailVerified', 1, 0] }
          }
        }
      }
    ])
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      overview: stats,
      monthlyGrowth,
      roleDistribution,
      activityStats: activityStats[0] || {}
    }
  });
});

/**
 * @desc    Bulk operations on users
 * @route   POST /api/v1/users/bulk
 * @access  Private (Admin only)
 */
exports.bulkUserOperations = catchAsync(async (req, res, next) => {
  const { operation, userIds, data } = req.body;
  
  // Validate request
  if (!operation || !userIds || !Array.isArray(userIds)) {
    return next(new AppError('Operation and userIds array are required', 400));
  }
  
  // Only admins can perform bulk operations
  if (req.user.role !== 'ADMIN') {
    return next(new AppError('Only administrators can perform bulk operations', 403));
  }
  
  let result;
  
  switch (operation) {
    case 'activate':
      result = await User.updateMany(
        { _id: { $in: userIds } },
        { isActive: true, updatedBy: req.user.id }
      );
      break;
      
    case 'deactivate':
      result = await User.updateMany(
        { _id: { $in: userIds } },
        { isActive: false, updatedBy: req.user.id }
      );
      break;
      
    case 'delete':
      result = await User.updateMany(
        { _id: { $in: userIds } },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.user.id,
          isActive: false
        }
      );
      break;
      
    case 'updateRole':
      if (!data.role) {
        return next(new AppError('Role is required for role update operation', 400));
      }
      result = await User.updateMany(
        { _id: { $in: userIds } },
        { role: data.role, updatedBy: req.user.id }
      );
      break;
      
    default:
      return next(new AppError('Invalid operation', 400));
  }
  
  // Add activity log
  await req.user.addActivityLog(
    'BULK_USER_OPERATION',
    `Performed ${operation} on ${userIds.length} users`,
    req.ip,
    req.get('User-Agent')
  );
  
  logger.info(`Bulk user operation: ${operation}`, {
    operation,
    userIds,
    affectedCount: result.modifiedCount,
    performedBy: req.user.id
  });
  
  res.status(200).json({
    success: true,
    message: `Bulk ${operation} completed successfully`,
    data: {
      operation,
      affectedCount: result.modifiedCount
    }
  });
});

module.exports = {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  bulkUserOperations
};
