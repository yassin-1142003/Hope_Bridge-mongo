const rateLimit = require('express-rate-limit');
const auth = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const { userValidation } = require('../../../validation/userValidation');

/**
 * User Routes - Enhanced with Security and Performance
 * Features: Rate limiting, authentication, validation, caching
 */

// Rate limiting for user operations
const userRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Route-specific middleware
const middleware = [
  userRateLimit,
  auth, // Authentication middleware
  validate // Request validation middleware
];

// Export middleware for auto-loader
module.exports = {
  middleware,
  path: '/users'
};
