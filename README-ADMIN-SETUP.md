# HopeBridge Admin Panel - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB running locally or connection string
- npm/yarn package manager

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
```

**Required Environment Variables:**
```env
MONGODB_URI=mongodb://localhost:27017/hopebridge
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Admin User

```bash
# Run the admin creation script
npx ts-node scripts/create-admin.ts
```

This creates:
- **Email**: `admin@hopebridge.org`
- **Password**: `admin123`
- **Role**: `ADMIN`

### 4. Start Development Server

```bash
npm run dev
```

## 🌐 Access Points

| Page | URL | Description |
|------|-----|-------------|
| **Home** | `http://localhost:3000` | Main landing page |
| **Sign In** | `http://localhost:3000/auth/signin` | User login |
| **Register** | `http://localhost:3000/auth/register` | User registration |
| **Admin Panel** | `http://localhost:3000/admin` | Admin dashboard |

## 🔐 Default Credentials

```
Email: admin@hopebridge.org
Password: admin123
```

## 📊 Admin Panel Features

### Dashboard (`/admin`)
- Real-time statistics (users, projects, posts)
- Quick access to all management sections
- User authentication and role verification

### Posts Management (`/admin/posts`)
- **List**: View all posts with filtering
- **Create**: Add new posts with rich content
- **Edit**: Update existing posts
- **Delete**: Remove posts with confirmation

### Projects Management (`/admin/projects`)
- **List**: Grid view of all projects
- **Create**: New projects with banner and media
- **Edit**: Update project details and media
- **Delete**: Remove projects safely

### Users Management (`/admin/users`)
- **List**: View all registered users
- **Create**: Add new users with role assignment
- **Edit**: Update user details and status
- **Deactivate**: Enable/disable user accounts

## 🛡️ Security Features

### Authentication System
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Role-Based Access**: Admin-only endpoints protected
- **Token Verification**: Automatic token validation

### API Security
- **Admin Protection**: All admin APIs require admin role
- **Input Validation**: Proper data validation and sanitization
- **Error Handling**: Comprehensive error responses
- **CORS Support**: Proper cross-origin handling

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String, // bcryptjs hashed
  role: 'USER' | 'ADMIN',
  isActive: Boolean,
  emailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Posts Collection
```javascript
{
  _id: ObjectId,
  contents: [{
    language_code: String,
    name: String,
    description: String,
    content: String
  }],
  images: [String],
  videos: [String],
  category: String,
  status: 'draft' | 'published',
  slug: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Projects Collection
```javascript
{
  _id: ObjectId,
  contents: [{
    language_code: String,
    name: String,
    description: String,
    content: String,
    images: [String],
    videos: [String],
    documents: [String]
  }],
  bannerPhotoUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Admin APIs (Admin Only)
- `GET /api/admin/overview` - Dashboard statistics
- `GET /api/admin/users` - List all users

### Posts CRUD
- `GET /api/posts` - List posts (public)
- `POST /api/posts` - Create post (admin)
- `GET /api/posts/[id]` - Get single post
- `PATCH /api/posts/[id]` - Update post (admin)
- `DELETE /api/posts/[id]` - Delete post (admin)

### Projects CRUD
- `GET /api/projects` - List projects (public)
- `POST /api/projects` - Create project (admin)
- `GET /api/projects/[id]` - Get single project
- `PATCH /api/projects/[id]` - Update project (admin)
- `DELETE /api/projects/[id]` - Delete project (admin)

## 🎨 Frontend Architecture

### Components Structure
```
app/
├── auth/
│   ├── signin/page.tsx      # Login page
│   └── register/page.tsx    # Registration page
├── admin/
│   ├── page.tsx             # Dashboard
│   ├── users/               # User management
│   ├── posts/               # Post management
│   └── projects/            # Project management
└── page.tsx                 # Home page
```

### Key Files
- `hooks/useAuth.tsx` - Authentication context
- `lib/mongodb.ts` - Database connection
- `app/layout.tsx` - Root layout with AuthProvider

## 🚀 Production Deployment

### Environment Setup
1. Set secure `JWT_SECRET`
2. Configure production `MONGODB_URI`
3. Set appropriate `NEXT_PUBLIC_API_URL`

### Security Considerations
- Change default admin password
- Use HTTPS in production
- Configure proper CORS origins
- Set up database authentication
- Enable rate limiting

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check MongoDB is running
mongod

# Verify connection string
echo $MONGODB_URI
```

**JWT Token Issues**
```bash
# Clear browser localStorage
# Or logout and login again
```

**Admin Access Denied**
```bash
# Verify admin role in database
mongosh hopebridge
db.users.findOne({email: "admin@hopebridge.org"})
```

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For issues with:
- **Database**: Check MongoDB connection
- **Authentication**: Verify JWT secret and tokens
- **Permissions**: Ensure user has ADMIN role
- **Build**: Check all dependencies are installed

## 🎯 Next Steps

1. **Customize** the admin panel design
2. **Add** more user roles and permissions
3. **Implement** email verification
4. **Add** file upload capabilities
5. **Set up** monitoring and logging
6. **Configure** production deployment

---

**🎉 Your HopeBridge Admin Panel is now ready!**
