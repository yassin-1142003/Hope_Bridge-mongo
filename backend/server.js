require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const { socketAuth } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const alertRoutes = require('./routes/alerts');
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const notificationsNamespace = io.of('/notifications');
notificationsNamespace.use(socketAuth);

notificationsNamespace.on('connection', (socket) => {
  console.log(`User ${socket.user.firstName} ${socket.user.lastName} connected to notifications`);
  
  socket.join(socket.user._id.toString());
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.user.firstName} ${socket.user.lastName} disconnected from notifications`);
  });
});

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.io = notificationsNamespace;
  next();
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/task-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/chat', chatRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    message: 'Internal server error', 
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO notifications namespace: /notifications`);
});

module.exports = { app, server, io };
