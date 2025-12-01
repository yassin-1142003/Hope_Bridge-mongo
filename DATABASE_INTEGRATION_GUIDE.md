# 🗄️ Database Integration Guide

## 📋 Overview

This guide covers the complete database integration for the Hope Bridge charity management system. The system uses multiple MongoDB databases to handle different aspects of the charity operations.

## 🏗️ Database Architecture

### 1. Hope Bridge Database (`hopebridge`)

**Purpose**: Main charity operations

- **Users**: Charity volunteers, donors, and staff
- **Projects**: Charity projects and campaigns
- **Donations**: Financial contributions and transactions
- **Volunteers**: Volunteer applications and assignments

### 2. Task Management Database (`taskManagement`)

**Purpose**: Internal task and project management

- **Tasks**: Internal tasks and assignments
- **TaskUsers**: Task management system users
- **TaskProjects**: Internal projects
- **TimeEntries**: Time tracking for tasks

### 3. Charity Database (`charity`)

**Purpose**: Content management and communication

- **Users**: Charity blog and content users
- **Posts**: Blog posts and announcements
- **Comments**: User comments on posts
- **Notifications**: System notifications

## 🔗 Connection Configuration

### Environment Variables

```env
# MongoDB Connections
MONGODB_URI=mongodb://localhost:27017/hopebridge
TASK_MONGODB_URI=mongodb://localhost:27017/task-management
CHARITY_DB_URI=mongodb://localhost:27017/charity

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Database Manager

The system uses a centralized `DatabaseManager` class to handle all database connections:

```typescript
import DatabaseManager from '@/lib/database';

// Connect to all databases
await DatabaseManager.getInstance().connectAll();

// Get specific database connection
const hopebridgeDb = DatabaseManager.getInstance().getConnection('hopebridge');
```

## 🚀 API Endpoints

### Database Management

- `POST /api/database/connect` - Connect to all databases
- `GET /api/database/connect` - Get connection status
- `DELETE /api/database/connect` - Disconnect from all databases

### Hope Bridge APIs

- `GET /api/hopebridge/users` - Get all users
- `POST /api/hopebridge/users` - Create new user
- `GET /api/hopebridge/projects` - Get all projects
- `POST /api/hopebridge/projects` - Create new project
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Create new donation

### Task Management APIs

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task

### Dashboard APIs

- `GET /api/dashboard/stats` - Get comprehensive dashboard statistics

## 📊 Database Schemas

### Hope Bridge - User Schema

```typescript
{
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'VOLUNTEER' | 'DONOR';
  phone?: string;
  address?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin: Date;
}
```

### Hope Bridge - Project Schema

```typescript
{
  title: string;
  description: string;
  category: 'EDUCATION' | 'HEALTH' | 'FOOD' | 'SHELTER' | 'EMERGENCY' | 'OTHER';
  targetAmount: number;
  currentAmount: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'AED';
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PAUSED';
  startDate: Date;
  endDate: Date;
  images: string[];
  location: string;
  coordinator: ObjectId;
  volunteers: ObjectId[];
}
```

### Task Management - Task Schema

```typescript
{
  title: string;
  description: string;
  assignedTo: ObjectId;
  createdBy: ObjectId;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';
  category: 'DEVELOPMENT' | 'DESIGN' | 'MARKETING' | 'ADMIN' | 'FINANCE' | 'OPERATIONS';
  dueDate: Date;
  estimatedHours?: number;
  actualHours: number;
  progress: number;
}
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install mongoose bcryptjs
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database URLs
```

### 3. Initialize Databases

```bash
# Run the database initialization script
node scripts/init-databases.js
```

### 4. Start the Application

```bash
npm run dev
```

### 5. Test Database Connection

```bash
# Test connection endpoint
curl -X POST http://localhost:3001/api/database/connect
```

## 📈 Usage Examples

### Creating a New User

```javascript
const response = await fetch('/api/hopebridge/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'VOLUNTEER'
  })
});
```

### Getting Dashboard Statistics

```javascript
const response = await fetch('/api/dashboard/stats');
const stats = await response.json();
console.log(stats.data.hopeBridge.users.total);
```

### Creating a New Task

```javascript
const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Design new landing page',
    description: 'Create a modern landing page for the charity website',
    assignedTo: 'user_id_here',
    createdBy: 'creator_id_here',
    priority: 'HIGH',
    dueDate: '2024-12-31T23:59:59Z'
  })
});
```

## 🛠️ Database Operations

### Connection Management

```typescript
// Connect to all databases
await DatabaseManager.getInstance().connectAll();

// Connect to specific database
await DatabaseManager.getInstance().connect('hopebridge');

// Check connection status
const status = DatabaseManager.getInstance().getConnectionStatus();

// Disconnect from all databases
await DatabaseManager.getInstance().disconnectAll();
```

### Model Usage

```typescript
import { getHopeBridgeModels } from '@/lib/database/models/hopebridge';

const { User, Project, Donation, Volunteer } = getHopeBridgeModels();

// Create user
const user = new User({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashed_password',
  role: 'VOLUNTEER'
});
await user.save();

// Find projects
const projects = await Project.find({ status: 'ACTIVE' })
  .populate('coordinator', 'name email')
  .sort({ createdAt: -1 });
```

## 🔍 Monitoring and Debugging

### Database Connection Status

```javascript
// Check all database connections
const status = await fetch('/api/database/connect');
console.log(await status.json());
```

### Error Handling

All API endpoints include comprehensive error handling:

- Database connection errors
- Validation errors
- Duplicate key errors
- Server errors

### Logging

Database operations are logged with:

- Connection status
- Query performance
- Error details
- Operation timestamps

## 🚀 Deployment Considerations

### Production Environment

1. Use MongoDB Atlas for cloud hosting
2. Enable authentication and SSL
3. Configure connection pooling
4. Set up database backups
5. Monitor performance metrics

### Security

1. Use environment variables for credentials
2. Enable database authentication
3. Implement rate limiting
4. Validate all inputs
5. Use HTTPS for all API calls

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Database Best Practices](https://www.mongodb.com/blog/post/building-with-patterns-a-summary)

## 🆘 Troubleshooting

### Common Issues

1. **Connection Failed**: Check MongoDB URL and ensure MongoDB is running
2. **Model Not Found**: Ensure database is connected before using models
3. **Validation Error**: Check schema validation rules
4. **Permission Denied**: Verify database credentials

### Debug Steps

1. Check database connection status
2. Verify environment variables
3. Check MongoDB logs
4. Test with simple queries
5. Enable debug logging

## 📞 Support

For database-related issues:

1. Check the logs in the console
2. Verify database connectivity
3. Review the API responses
4. Consult the MongoDB documentation
5. Contact the development team

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintainer**: Hope Bridge Development Team
