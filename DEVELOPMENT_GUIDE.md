# HopeBridge Development Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Setup Commands

```bash
# Clone the repository
git clone <repository-url>
cd hopebridge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up the database
npm run setup:db

# Start development server
npm run dev
```

## 📁 Project Structure

```text
hopebridge/
├── app/                          # Next.js 13+ app directory
│   ├── [locale]/                 # Internationalized routes
│   │   ├── dashboard/           # Dashboard pages
│   │   │   ├── page.tsx         # Main dashboard
│   │   │   ├── tasks/           # Task management
│   │   │   └── admin/           # Admin panels
│   │   ├── projects/            # Projects page
│   │   └── layout.tsx          # Main layout with chat widget
│   ├── api/                     # API routes
│   │   ├── projects/           # Project management API
│   │   ├── tasks/              # Task management API
│   │   ├── analytics/           # Analytics API
│   │   └── test-db/            # Database testing
│   └── globals.css             # Global styles
├── components/                  # React components
│   ├── chat/                   # Chat widget system
│   ├── dashboard/              # Dashboard components
│   └── ui/                     # Reusable UI components
├── hooks/                      # Custom React hooks
├── lib/                        # Utility libraries
│   ├── mongodb.ts              # Database connection
│   ├── roles.ts                # Role definitions
│   └── services/               # Business logic services
├── scripts/                    # Development scripts
│   ├── setup-database.js       # Database setup
│   └── test-all-apis.mjs      # API testing
└── messages/                   # Translation files
    ├── en.json                 # English translations
    └── ar.json                 # Arabic translations
```

## 🎯 Core Features

### 1. Role-Based Access Control

**Supported Roles:**

- SUPER_ADMIN
- ADMIN
- GENERAL_MANAGER
- PROGRAM_MANAGER
- PROJECT_COORDINATOR
- HR
- FINANCE
- PROCUREMENT
- STOREKEEPER
- ME (Monitoring & Evaluation)
- FIELD_OFFICER
- ACCOUNTANT
- USER

**Chat Widget Access:**

The chat widget appears only for users with `canSendMessages` permission:

- Admin, General Manager, Program Manager, Project Coordinators, HR, Finance, Procurement, Storekeeper, M&E, Field Officer, Accountant

### 2. Task Management System

**Features:**

- Role-based task visibility
- Task assignment and status tracking
- PDF attachment support
- Project integration
- Real-time updates

**Components:**

- `RoleBasedTaskDashboard` - Main task interface
- `TaskStatusSelector` - Status management
- `PrioritySelector` - Priority levels

### 3. Project Management

**Features:**

- Multilingual project content
- Image galleries
- Error handling with fallback data
- Task-project integration

### 4. Chat System

**Features:**

- Real-time messaging
- User search and online status
- Unread message counts
- Role-based visibility
- WCAG accessibility compliant

## 🛠️ Development Scripts

### Database Setup

```bash
# Set up database with sample data
node scripts/setup-database.js

# Test all API endpoints
node scripts/test-all-apis.mjs
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🌐 Internationalization

### Supported Languages

- English (en)
- Arabic (ar)

### Adding New Translations

1. Update `messages/en.json` and `messages/ar.json`
2. Use `useTranslations('namespace')` hook in components
3. Add locale-specific routing with `[locale]` parameter

### RTL/LTR Support

- Automatic direction handling based on locale
- CSS utilities for RTL layouts
- Component-level direction control

## 🔧 Configuration

### Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/charity

# Authentication
JWT_SECRET=your-secret-key
LOGIN_SECRET=your-login-secret

# URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001

# Localization
NEXT_PUBLIC_DEFAULT_LOCALE=en
DEFAULT_PROJECT_LOCALE=en
```

### Database Collections

- `users` - User accounts and roles
- `projects` - Project data and content
- `tasks` - Task management
- `analytics` - System analytics
- `audit_logs` - Activity tracking

## 🎨 UI/UX Guidelines

### Design System

- **Primary Color**: #d23e3e (Charity Red)
- **Dark Mode**: Full support with smooth transitions
- **Responsive**: Mobile-first design approach
- **Accessibility**: WCAG 2.1 AA compliant

### Component Patterns

- Use `motion` from Framer Motion for animations
- Implement proper loading states
- Add error boundaries and fallbacks
- Follow semantic HTML practices

## 🔒 Security Best Practices

### Authentication

- JWT-based authentication
- Role-based permissions
- Session management
- Protected API routes

### Data Protection

- Input validation and sanitization
- CORS configuration

- Rate limiting
- Secure headers

## 📊 Monitoring & Debugging

### Development Dashboard

Access `/dashboard/admin/dev-dashboard` for:

- System health monitoring
- API status checking
- Database connection status
- Performance metrics

### API Testing

Use the test script to verify all endpoints:

```bash
node scripts/test-all-apis.mjs
```

### Logging

- Comprehensive error logging
- API request/response logging
- Database operation tracking
- User activity monitoring

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Setup

1. Configure production environment variables
2. Set up MongoDB production database
3. Configure domain and SSL
4. Set up monitoring and logging

### Performance Optimization

- Image optimization with Next.js Image
- Code splitting and lazy loading
- Database query optimization
- CDN configuration

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues

- Check MONGODB_URI in .env.local
- Verify network connectivity
- Ensure MongoDB is running
- Check database user permissions

#### API 500 Errors

- Check server logs
- Verify database connection
- Test with API testing script
- Check environment variables

#### Chat Widget Not Appearing

- Verify user role has chat permissions
- Check AuthProvider integration
- Ensure useAuth hook is working
- Verify role definitions in lib/roles.ts

#### Tasks Not Loading

- Check TaskService implementation
- Verify database collections exist
- Test with sample data
- Check API route configuration

### Debug Tools

- Development dashboard for system health
- API testing script for endpoint verification
- Browser dev tools for client-side debugging
- MongoDB Compass for database inspection

## 📚 API Documentation

### Projects API

```text
GET /api/projects          # Get all projects
POST /api/projects         # Create new project (admin only)
PUT /api/projects/:id      # Update project
DELETE /api/projects/:id   # Delete project
```

### Tasks API

```text
GET /api/tasks             # Get user tasks (role-based)
POST /api/tasks            # Create new task
PUT /api/tasks/:id         # Update task status
DELETE /api/tasks/:id      # Delete task
```

### Database Test API

```text
GET /api/test-db           # Test database connection
```

## 🤝 Contributing

### Code Standards

- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add proper error handling

### Testing

- Test all API endpoints
- Verify role-based access
- Check responsive design
- Validate accessibility

### Git Workflow

1. Create feature branch
2. Implement changes with tests
3. Run development scripts
4. Submit pull request with description

## 📞 Support

For development issues:

1. Check this guide first
2. Use the development dashboard
3. Run API testing script
4. Check browser console for errors

---

### 🎉 Happy Development
