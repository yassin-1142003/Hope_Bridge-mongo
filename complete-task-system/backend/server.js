import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes and middleware
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import chatRoutes from './routes/chat.js';
import { protect, setUserOnline, setUserOffline, generalRateLimit } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline styles for development
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(generalRateLimit);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io available to controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token and get user
    const { protect } = await import('./middleware/auth.js');
    
    // Create a mock request object for token verification
    const mockReq = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };

    // This will set req.user if token is valid
    protect(mockReq, {}, () => {}).then(() => {
      if (mockReq.user) {
        socket.userId = mockReq.user._id;
        socket.user = mockReq.user;
        next();
      } else {
        next(new Error('Authentication error: Invalid token'));
      }
    }).catch(() => {
      next(new Error('Authentication error: Invalid token'));
    });
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  const userId = socket.userId;
  const user = socket.user;

  console.log(`✅ User connected: ${user.name} (${userId})`);

  // Join user to their personal room
  socket.join(userId.toString());

  // Set user online
  setUserOnline(userId);

  // Handle joining task-specific rooms
  socket.on('join_task', (taskId) => {
    socket.join(`task_${taskId}`);
    console.log(`📋 User ${user.name} joined task room: ${taskId}`);
  });

  // Handle leaving task-specific rooms
  socket.on('leave_task', (taskId) => {
    socket.leave(`task_${taskId}`);
    console.log(`📋 User ${user.name} left task room: ${taskId}`);
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { receiverId } = data;
    socket.to(receiverId).emit('user_typing', {
      userId,
      userName: user.name,
      isTyping: true
    });
  });

  socket.on('typing_stop', (data) => {
    const { receiverId } = data;
    socket.to(receiverId).emit('user_typing', {
      userId,
      userName: user.name,
      isTyping: false
    });
  });

  // Handle message read receipts
  socket.on('message_read', (data) => {
    const { messageId, senderId } = data;
    socket.to(senderId).emit('message_read_receipt', {
      messageId,
      readBy: userId
    });
  });

  // Handle online status updates
  socket.on('update_status', (data) => {
    const { isOnline } = data;
    // Broadcast to all users except sender
    socket.broadcast.emit('user_status_updated', {
      userId,
      userName: user.name,
      isOnline,
      lastSeen: new Date()
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${user.name} (${userId})`);
    
    // Set user offline
    setUserOffline(userId);

    // Broadcast offline status
    socket.broadcast.emit('user_status_updated', {
      userId,
      userName: user.name,
      isOnline: false,
      lastSeen: new Date()
    });
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error for user ${user.name}:`, error);
  });
});

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    const db = mongoose.connection.db;
    
    // Create text indexes for search functionality
    await db.collection('users').createIndex({ 
      name: 'text', 
      email: 'text' 
    });
    
    await db.collection('tasks').createIndex({ 
      title: 'text', 
      description: 'text',
      tags: 'text'
    });
    
    await db.collection('chatmessages').createIndex({ 
      message: 'text' 
    });
    
    console.log('✅ Database indexes created');
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Server error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(error.errors).map(err => err.message)
    });
  }
  
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field error',
      field: Object.keys(error.keyValue)[0]
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(() => {
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(() => {
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`💬 Socket.IO ready for connections`);
    console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled Promise Rejection:', error);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer().catch(error => {
  console.error('💥 Failed to start server:', error);
  process.exit(1);
});

export default app;
