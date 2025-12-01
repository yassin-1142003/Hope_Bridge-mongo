const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const dotenv = require('dotenv');

const EnhancedAutoLoader = require('./api/enhancedAutoLoader');
const { enhancedErrorHandler } = require('./utils/enhancedErrorHandler');
const logger = require('./utils/logger');
const { generateRequestId } = require('./utils/enhancedErrorHandler');

/**
 * Production-Ready Server Configuration
 * Features: Security middleware, performance optimization, monitoring
 */

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Request ID middleware
app.use((req, res, next) => {
  req.id = generateRequestId();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.API_URL || "http://localhost:3001"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Data sanitization middleware
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP parameter pollution

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      requestId: req.id
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      requestId: req.id
    });
  }
});

app.use(limiter);

// Health check endpoint (before other middleware)
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    requestId: req.id
  };

  res.status(200).json({
    success: true,
    data: health
  });
});

// API routes
const apiLoader = new EnhancedAutoLoader(app, {
  routesPath: './src/api/routes',
  middlewarePath: './src/middleware',
  apiVersion: process.env.API_VERSION || 'v1',
  basePath: process.env.API_BASE_PATH || '/api'
});

// Initialize API loader
apiLoader.initialize().catch(err => {
  logger.error('Failed to initialize API loader:', err);
  process.exit(1);
});

// 404 handler
app.use('*', (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  error.requestId = req.id;
  next(error);
});

// Global error handler
app.use(enhancedErrorHandler);

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed.');
    
    // Close database connections
    const mongoose = require('mongoose');
    mongoose.connection.close(() => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  logger.info(`🚀 Server running on ${HOST}:${PORT}`);
  logger.info(`📚 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 API Base URL: http://${HOST}:${PORT}/api/v1`);
  logger.info(`🏥 Health Check: http://${HOST}:${PORT}/health`);
  logger.info(`📖 API Docs: http://${HOST}:${PORT}/api-docs`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`);
  } else {
    logger.error('Server error:', err);
  }
  process.exit(1);
});

module.exports = app;
