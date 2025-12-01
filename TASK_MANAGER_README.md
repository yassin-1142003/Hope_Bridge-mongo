# 🚀 Task Management System

A complete, production-ready task management system built with Node.js, Express, MongoDB, and modern frontend technologies.

## ✨ Features

### 🔐 Authentication

- User registration and login
- JWT-based authentication
- Role-based access (Manager/Employee)
- Secure password hashing with bcrypt

### 📋 Task Management

- Send tasks to other users
- View sent and received tasks
- Update task status (Pending, In Progress, Done)
- File attachments support
- Real-time task updates

### 🎨 Modern UI

- Responsive Bootstrap 5 design
- Professional styling with custom CSS
- Modal-based task details
- Alert notifications for new tasks
- Auto-refresh every 10 seconds

### 📁 File Management

- Upload task attachments
- Support for images, documents, and ZIP files
- 5MB file size limit
- Secure file storage

## 🛠️ Technology Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **ES6 Modules** - Modern JavaScript

### Frontend

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties
- **JavaScript ES6+** - Modern JavaScript features
- **Bootstrap 5** - UI framework
- **Bootstrap Icons** - Icon library

## 📁 **Project Structure**

```
task-manager-backend/
├── models/
│   ├── User.js          # User model with authentication
│   └── Task.js          # Task model with relationships
├── controllers/
│   ├── authController.js # Authentication logic
│   └── taskController.js # Task management logic
├── middleware/
│   ├── auth.js          # JWT authentication middleware
│   └── upload.js        # File upload middleware
├── routes/
│   ├── auth.js          # Authentication routes
│   └── tasks.js         # Task management routes
├── uploads/             # File upload directory
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
└── .env.example         # Environment variables template

task-manager-frontend/
├── index.html           # Main HTML file
├── styles.css           # Custom CSS styling
├── app.js              # Frontend JavaScript application
└── README.md           # Frontend documentation
```

## 🚀 **Installation & Setup**

### **Prerequisites**
- Node.js (v14 or higher)
- MongoDB (installed and running)
- npm or yarn

### **Backend Setup**

1. **Navigate to backend directory**
   ```bash
   cd task-manager-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   MONGO_URI=mongodb://localhost:27017/task-manager
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=30d
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```
   
   The backend will run on `http://localhost:5000`

### **Frontend Setup**

1. **Navigate to frontend directory**
   ```bash
   cd task-manager-frontend
   ```

2. **Start a simple HTTP server**
   ```bash
   # Using Python (if available)
   python -m http.server 3000
   
   # Or using Node.js serve package
   npx serve -p 3000
   
   # Or using live-server
   npx live-server --port=3000
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

## 📖 **API Documentation**

### **Authentication Endpoints**

#### **Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employee"
}
```

#### **Login User**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### **Get Current User**
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### **Task Endpoints**

#### **Send Task**
```http
POST /api/tasks/send
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: Task Title
description: Task Description
receiver: user_id
attachment: [file]
```

#### **Get Received Tasks**
```http
GET /api/tasks/received
Authorization: Bearer <token>
```

#### **Get Sent Tasks**
```http
GET /api/tasks/sent
Authorization: Bearer <token>
```

#### **Get Task Details**
```http
GET /api/tasks/:id
Authorization: Bearer <token>
```

#### **Update Task Status**
```http
PATCH /api/tasks/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in-progress"
}
```

#### **Get New Tasks (Last 24 Hours)**
```http
GET /api/tasks/new
Authorization: Bearer <token>
```

## 🎯 **How to Use**

### **1. Registration & Login**
- Open the application in your browser
- Register a new account with name, email, password, and role
- Login with your credentials

### **2. Send Tasks**
- Fill out the "Send New Task" form
- Select a recipient from the dropdown
- Add title, description, and optional attachment
- Click "Send Task"

### **3. Manage Tasks**
- View tasks you've sent in the "Tasks I Sent" section
- View tasks you've received in the "Tasks I Received" section
- Click "Show Task" to view full details
- Update task status if you're the receiver

### **4. Real-time Updates**
- Tasks auto-refresh every 10 seconds
- New task alerts appear at the top
- Click "View New Tasks" to see recent assignments

## 🔒 **Security Features**

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **File Upload Security** - File type and size validation
- **Rate Limiting** - Protection against brute force attacks
- **CORS Protection** - Cross-origin resource sharing controls
- **Helmet.js** - Security headers and protections

## 📊 **Database Schema**

### **User Model**
```javascript
{
  name: String (required, max 50 chars),
  email: String (required, unique, valid email),
  password: String (required, min 6 chars, hashed),
  role: String (enum: ['manager', 'employee'], default: 'employee'),
  createdAt: Date,
  updatedAt: Date
}
```

### **Task Model**
```javascript
{
  title: String (required, max 200 chars),
  description: String (required, max 2000 chars),
  sender: ObjectId (ref: 'User', required),
  receiver: ObjectId (ref: 'User', required),
  attachment: String (optional),
  status: String (enum: ['pending', 'in-progress', 'done'], default: 'pending'),
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 **UI Features**

- **Responsive Design** - Works on all screen sizes
- **Modern Styling** - Clean, professional appearance
- **Interactive Elements** - Hover effects, transitions, animations
- **Accessibility** - Semantic HTML, ARIA labels
- **Loading States** - Visual feedback during operations
- **Error Handling** - User-friendly error messages

## 🔄 **Auto-refresh System**

- **10-second Intervals** - Automatic task list updates
- **Smart Refreshing** - Only updates when data changes
- **Background Updates** - Non-disruptive to user experience
- **Manual Refresh** - Users can trigger updates manually

## 📎 **File Upload Features**

- **Multiple Formats** - Images, documents, ZIP files
- **Size Limits** - 5MB maximum file size
- **Secure Storage** - Files stored in dedicated uploads folder
- **Download Links** - Direct file access in task details
- **Validation** - File type and size checking

## 🐛 **Error Handling**

- **Global Error Handler** - Catches all server errors
- **User Messages** - Clear, actionable error messages
- **Validation Errors** - Input validation with helpful feedback
- **Network Errors** - Graceful handling of connection issues
- **File Upload Errors** - Specific upload error messages

## 🚀 **Production Deployment**

### **Environment Variables**
```env
NODE_ENV=production
MONGO_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
PORT=5000
FRONTEND_URL=https://your-domain.com
```

### **Security Considerations**
- Use environment variables for sensitive data
- Enable HTTPS in production
- Use a reverse proxy (nginx/Apache)
- Regular database backups
- Monitor application logs

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

For issues and questions:
1. Check the documentation
2. Review the API endpoints
3. Test with the provided examples
4. Create an issue with detailed information

---

## 🎉 **Ready to Use!**

The Task Management System is now complete and ready for production use. Follow the installation steps above to get started with managing tasks efficiently!
