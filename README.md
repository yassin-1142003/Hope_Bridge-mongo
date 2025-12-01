# HopeBridge Charity Management System

A comprehensive charity management platform built with Next.js 13+, MongoDB, and modern web technologies. Features role-based task management, project tracking, multilingual support, and real-time chat system.

## 🌟 Key Features

### 🎯 Role-Based Access Control

- **13 User Roles** with granular permissions
- **Admin, General Manager, Program Manager, Project Coordinators, HR, Finance, Procurement, Storekeeper, M&E, Field Officer, Accountant**
- **Chat Widget** - Available only for authorized roles
- **Task Visibility** - Role-based task assignment and viewing

### 💬 Real-Time Chat System

- **Role-Based Access** - Only for specified roles
- **WCAG Compliant** - Full accessibility support
- **Cross-Browser Compatible** - Works on all modern browsers
- **Real-Time Messaging** - Live chat with online status indicators
- **Unread Notifications** - Message badges and alerts

### 📋 Advanced Task Management

- **Role-Based Task Dashboard** - Personalized task views
- **Project Integration** - Tasks linked to charity projects
- **PDF Attachments** - Document management with viewer
- **Status Tracking** - Complete task lifecycle management
- **Priority Levels** - Urgent, High, Medium, Low priority

### 🌐 Multilingual Support

- **English & Arabic** - Complete localization
- **RTL/LTR Support** - Automatic text direction
- **Dynamic Translations** - Real-time language switching
- **Localized UI** - Culture-appropriate interfaces

### 🏢 Project Management

- **Multilingual Projects** - Content in multiple languages
- **Media Galleries** - Image and video management
- **Error Handling** - Graceful fallbacks when database unavailable
- **Task Integration** - Projects linked to tasks

### 🎨 Modern UI/UX

- **Glass Morphism Design** - Beautiful modern interface
- **Dark Mode Support** - Complete theme switching
- **Responsive Design** - Mobile-first approach
- **Smooth Animations** - Framer Motion powered
- **Accessibility** - WCAG 2.1 AA compliant

## 🛠️ Tech Stack

### Frontend

- **Next.js 13+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations and transitions
- **next-intl** - Internationalization
- **Lucide React** - Icon system

### Backend & Database

- **MongoDB Atlas** - Cloud database
- **Next.js API Routes** - Serverless API
- **JWT Authentication** - Secure user sessions
- **Role-Based Permissions** - Granular access control

### Development Tools

- **ESLint** - Code quality
- **TypeScript** - Static typing
- **Hot Reload** - Fast development
- **API Testing** - Comprehensive test suite

## Project Structure

```text
hopebridge/
├── app/                          # Next.js 13+ app directory
│   ├── [locale]/                 # Internationalized routes
│   │   ├── dashboard/           # Dashboard pages
│   │   │   ├── page.tsx         # Main dashboard with task overview
│   │   │   ├── tasks/           # Task management system
│   │   │   └── admin/           # Admin panels
│   │   ├── projects/            # Projects page
│   │   └── layout.tsx          # Main layout with chat widget
│   ├── api/                     # API routes
│   │   ├── projects/           # Project management API
│   │   ├── tasks/              # Task management API
│   │   ├── analytics/           # Analytics API
│   │   └── test-db/            # Database testing endpoint
│   └── globals.css             # Global styles with Tailwind
├── components/                  # React components
│   ├── chat/                   # Chat widget system
│   │   └── ChatWidget.tsx      # Role-based chat component
│   ├── dashboard/              # Dashboard components
│   │   └── RoleBasedTaskDashboard.tsx
│   └── ui/                     # Reusable UI components
├── hooks/                      # Custom React hooks
│   ├── useAuth.tsx            # Authentication hook
│   └── useRoleBasedTasks.ts   # Task management hook
├── lib/                        # Utility libraries
│   ├── mongodb.ts              # Database connection
│   ├── roles.ts                # Role definitions
│   └── services/               # Business logic services
├── scripts/                    # Development scripts
│   ├── setup-database.js       # Database setup with sample data
│   └── test-all-apis.mjs      # API testing suite
├── messages/                   # Translation files
│   ├── en.json                 # English translations
│   └── ar.json                 # Arabic translations
└── public/                     # Static assets
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
