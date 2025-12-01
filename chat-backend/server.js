import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Import routes
import chatRoutes from './routes/chat.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid token'
      });
    }
    req.user = user;
    next();
  });
};

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    socket.userId = decoded.id;
    next();
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected to chat`);
  
  // Join user to their personal room for private messages
  socket.join(socket.userId);
  
  // Handle joining chat rooms
  socket.on('join_chat', (userId) => {
    const room = [socket.userId, userId].sort().join('_');
    socket.join(room);
    console.log(`User ${socket.userId} joined chat with ${userId}`);
  });
  
  // Handle leaving chat rooms
  socket.on('leave_chat', (userId) => {
    const room = [socket.userId, userId].sort().join('_');
    socket.leave(room);
    console.log(`User ${socket.userId} left chat with ${userId}`);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected from chat`);
  });
});

// Make io available to controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/chat', authenticateToken, chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Chat server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Chat server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Chat server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Socket.IO ready for connections`);
});

export default app;
