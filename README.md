# Task Management System

A complete full-stack task management application built with Node.js, Express, MongoDB, and React. Features real-time notifications, user authentication, and comprehensive task management capabilities.

## Features

- 🔐 **User Authentication** - JWT-based secure login/registration system
- 📋 **Task Management** - Create, update, and track tasks with priorities and due dates
- 🔄 **Real-time Updates** - Socket.IO integration for instant notifications
- 📊 **Dashboard** - View sent and received tasks with filtering options
- 💬 **Comments & Activity** - Add comments and track task history
- 🔔 **Alerts System** - Get notified about overdue tasks and new assignments
- 🔗 **Related Tasks** - Find related tasks by project, tags, or due dates
- 📱 **Responsive Design** - Modern UI built with Tailwind CSS

## Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend

- **React** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Heroicons** - Icons
- **Socket.IO Client** - Real-time updates
- **Axios** - HTTP client

## Project Structure

```text
├── backend/
│   ├── models/          # MongoDB models (User, Task, Comment, Activity)
│   ├── routes/          # API routes
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication and validation
│   ├── scripts/         # Seed script
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
│   └── public/          # Static files
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (installed and running)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
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
   MONGO_URI=mongodb://localhost:27017/task-management
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Seed the database**

   ```bash
   npm run seed
   ```

   This creates sample users and tasks for testing.

5. **Start the backend server**

   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` if needed:

   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

4. **Start the frontend development server**

   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`

## Demo Accounts

After running the seed script, you can use these accounts:

- **Admin**: `john@example.com` / `Password123`
- **Manager**: `jane@example.com` / `Password123`
- **User**: `bob@example.com` / `Password123`
- **User**: `alice@example.com` / `Password123`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Tasks

- `GET /api/tasks/my-sent` - Get tasks sent by user
- `GET /api/tasks/my-received` - Get tasks received by user
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task
- `POST /api/tasks/:id/comments` - Add comment to task
- `POST /api/tasks/:id/mark-complete` - Mark task as complete
- `POST /api/tasks/:id/reminder` - Send reminder for task
- `GET /api/tasks/:id/related` - Get related tasks

### Alerts

- `GET /api/alerts` - Get user alerts
- `PATCH /api/alerts/:alertId/read` - Mark alert as read

## Real-time Events

The system uses Socket.IO for real-time updates:

- `task_assigned` - When a new task is assigned
- `task_updated` - When a task is updated
- `alert` - When an alert is triggered

## Features in Detail

### Task Management

- Create tasks with title, description, priority, and due date
- Assign tasks to other users
- Track task status (pending, in-progress, completed)
- Add comments and attachments
- View task activity timeline

### Dashboard

- Separate views for "Tasks I Sent" and "Tasks I Received"
- Filter by status, priority, and search
- Real-time task counters
- Responsive card-based layout

### Alerts System

- Automatic detection of overdue tasks
- Notifications for tasks due within 48 hours
- Alerts for urgent tasks
- New assignment notifications

### Real-time Updates

- Instant notifications for task assignments
- Real-time status updates
- Live alert notifications
- Connection status indicator

## Development

### Running Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### Building for Production

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you have any questions or issues, please open an issue on GitHub.

---

Built with ❤️ by Penguin Alpha
