# 🚀 Complete Task Management System with Chat

A production-ready task management system with integrated real-time chat functionality. Built with Node.js, Express, MongoDB, and Socket.IO.

## ✨ Features

### 📋 Task Management
- ✅ **Multi-user task assignment** - Assign tasks to multiple users
- ✅ **Task status tracking** - New, Pending, In Progress, Completed, Cancelled
- ✅ **Priority levels** - Low, Medium, High, Urgent
- ✅ **File attachments** - Upload documents and images
- ✅ **Task comments** - Collaborative discussion on tasks
- ✅ **Due date management** - Set and track deadlines
- ✅ **Task filtering** - Filter by status, priority, search
- ✅ **Real-time updates** - Live task status changes
- ✅ **Auto-refresh** - Tasks update every 10 seconds
- ✅ **New task alerts** - Bell notifications for new tasks

### 💬 Chat System
- ✅ **Real-time messaging** - Instant chat between users
- ✅ **User presence** - Online/offline status indicators
- ✅ **Typing indicators** - See when someone is typing
- ✅ **Message reactions** - React with emojis
- ✅ **File sharing** - Send images and documents
- ✅ **Emoji picker** - 150+ emojis available
- ✅ **Read receipts** - Know when messages are read
- ✅ **Message history** - Persistent chat storage
- ✅ **Task-linked chat** - Chat directly from task details
- ✅ **Unread message badges** - Never miss important messages

### 🔐 Authentication & Security
- ✅ **JWT authentication** - Secure token-based auth
- ✅ **User roles** - Admin, Manager, Employee
- ✅ **Password hashing** - bcrypt encryption
- ✅ **Rate limiting** - Prevent API abuse
- ✅ **Input validation** - XSS protection
- ✅ **CORS protection** - Secure cross-origin requests

### 📱 User Experience
- ✅ **Responsive design** - Works on all devices
- ✅ **Modern UI** - Clean, professional interface
- ✅ **Real-time notifications** - Toast alerts
- ✅ **Smooth animations** - Polished interactions
- ✅ **Profile management** - Edit user information
- ✅ **Statistics dashboard** - Task analytics
- ✅ **Search functionality** - Find users and tasks

## 🏗️ Architecture

### Backend (Node.js + Express)
```
backend/
├── models/
│   ├── User.js          # User schema and methods
│   ├── Task.js          # Task schema and methods
│   └── ChatMessage.js   # Chat message schema
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── taskController.js    # Task operations
│   └── chatController.js    # Chat functionality
├── middleware/
│   ├── auth.js           # JWT and auth middleware
│   └── upload.js         # File upload handling
├── routes/
│   ├── auth.js          # Auth routes
│   ├── users.js         # User routes
│   ├── tasks.js         # Task routes
│   └── chat.js          # Chat routes
├── uploads/             # File storage
└── server.js            # Main server file
```

### Frontend (HTML + CSS + JavaScript)
```
frontend/
├── css/
│   ├── dashboard.css    # Main dashboard styles
│   └── chat.css         # Chat system styles
├── js/
│   ├── auth.js          # Authentication logic
│   ├── tasks.js         # Task management
│   ├── chat.js          # Chat system
│   └── dashboard.js     # Dashboard controller
└── index.html           # Main application
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB running locally or connection string
- Git for cloning

### 1. Clone and Setup
```bash
git clone <repository-url>
cd complete-task-system
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# MONGO_URI=mongodb://localhost:27017/complete-task-system
# JWT_SECRET=your-super-secret-jwt-key
# FRONTEND_URL=http://localhost:3000

# Start the server
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../frontend

# Serve with any HTTP server
python -m http.server 3000
# or
npx serve -p 3000
# or use Live Server extension in VS Code
```

Frontend runs on: `http://localhost:3000`

### 4. Access the Application
1. Open `http://localhost:3000` in your browser
2. Register a new account or login
3. Start creating tasks and chatting!

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/all` - Get all users for task assignment
- `GET /api/users/online` - Get online users
- `GET /api/users/search?q=query` - Search users
- `GET /api/users/stats` - Get user statistics

### Tasks
- `POST /api/tasks/create` - Create new task (with file upload)
- `GET /api/tasks/my-tasks` - Get user's tasks (received + sent)
- `GET /api/tasks/sent` - Get tasks sent by user
- `GET /api/tasks/received` - Get tasks received by user
- `GET /api/tasks/new` - Get new/unread tasks
- `GET /api/tasks/:taskId` - Get task details
- `PATCH /api/tasks/:taskId/status` - Update task status
- `DELETE /api/tasks/:taskId` - Delete task
- `POST /api/tasks/:taskId/comment` - Add comment to task

### Chat
- `GET /api/chat/users` - Get users for chat
- `GET /api/chat/:userId` - Get conversation with user
- `POST /api/chat/:userId` - Send message (with file upload)
- `POST /api/chat/:userId/read` - Mark messages as read
- `GET /api/chat/conversations` - Get conversation list
- `GET /api/chat/unread/count` - Get unread message count
- `POST /api/chat/message/:messageId/reaction` - Add reaction
- `PUT /api/chat/message/:messageId` - Edit message
- `DELETE /api/chat/message/:messageId` - Delete message

## 🔧 Configuration

### Environment Variables (.env)
```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/complete-task-system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

## 🎯 Usage Guide

### Creating Tasks
1. Click "Create Task" button
2. Fill in task title and description
3. Select priority level
4. Choose users to assign (multi-select)
5. Set due date (optional)
6. Add tags (optional)
7. Attach file (optional)
8. Click "Create Task"

### Managing Tasks
- **View Tasks**: See all tasks in the main dashboard
- **Filter Tasks**: Use status, priority, and search filters
- **Update Status**: Click status buttons in task details
- **Add Comments**: Discuss tasks with team members
- **Chat About Task**: Click chat button to discuss specific task

### Using Chat
1. Click chat icon in bottom-right corner
2. Select a user from the list
3. Type and send messages
4. Use emoji picker for reactions
5. Share files with attachment button
6. See online status and typing indicators

### Real-time Features
- **Task Updates**: See status changes instantly
- **New Task Alerts**: Bell icon shows new tasks
- **Chat Messages**: Real-time messaging
- **User Presence**: See who's online
- **Typing Indicators**: Know when someone is typing

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt encryption
- **Input Validation**: XSS protection
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Secure cross-origin requests
- **File Upload Security**: Type and size validation

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/manager/employee),
  department: String,
  avatar: String,
  isOnline: Boolean,
  lastSeen: Date
}
```

### Task Model
```javascript
{
  title: String,
  description: String,
  sender: ObjectId (ref: User),
  receivers: [ObjectId] (ref: User),
  status: String (new/pending/in-progress/completed/cancelled),
  priority: String (low/medium/high/urgent),
  attachment: Object,
  tags: [String],
  dueDate: Date,
  comments: [{ user: ObjectId, text: String, createdAt: Date }],
  statusHistory: [{ status: String, changedBy: ObjectId, changedAt: Date }]
}
```

### Chat Message Model
```javascript
{
  conversationId: String,
  sender: ObjectId (ref: User),
  receiver: ObjectId (ref: User),
  message: String,
  messageType: String (text/file/image/emoji),
  attachment: Object,
  taskId: ObjectId (ref: Task),
  isRead: Boolean,
  reactions: [{ user: ObjectId, emoji: String }]
}
```

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production MongoDB
4. Set up reverse proxy (nginx)
5. Enable HTTPS
6. Configure file storage for production

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Add tests if applicable
5. Submit pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Create an issue in the repository

## 🔄 Updates

The system includes automatic updates:
- **Tasks**: Refresh every 10 seconds
- **Online Status**: Update every 5 minutes
- **Real-time**: Socket.IO for instant updates

## 🎉 Features Summary

- ✅ **Complete Task Management** - Full CRUD operations
- ✅ **Multi-user Assignment** - Assign to multiple users
- ✅ **Real-time Chat** - Instant messaging
- ✅ **File Sharing** - Upload and share files
- ✅ **User Management** - Registration, authentication, profiles
- ✅ **Notifications** - Real-time alerts and updates
- ✅ **Responsive Design** - Works on all devices
- ✅ **Security** - JWT auth, input validation, rate limiting
- ✅ **Analytics** - Task statistics and dashboard
- ✅ **Modern UI** - Clean, professional interface

This is a **complete, production-ready** task management system with integrated chat functionality. All features are fully implemented and tested! 🚀
