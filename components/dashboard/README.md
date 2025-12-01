# 🎯 Role-Based Task Management System

## 📋 Overview

Complete role-based task management system with PDF display functionality. Users can see their assigned tasks, update status, and view uploaded PDFs directly in the browser.

## 🏗️ Architecture

### **Core Components**

1. **useRoleBasedTasks Hook** - Custom hook for fetching and managing user tasks
2. **RoleBasedTaskDashboard** - Main dashboard for viewing assigned tasks
3. **PDFViewer** - Advanced PDF viewer with zoom, rotation, and fullscreen
4. **TaskCreationForm** - Form for creating tasks with PDF uploads

### **API Routes**

1. **GET /api/tasks/user/[userId]** - Fetch tasks for specific user
2. **PATCH /api/tasks/[taskId]/status** - Update task status
3. **POST /api/tasks** - Create new task with attachments

## 🚀 Quick Start

### **1. Install Dependencies**

```bash
npm install framer-motion lucide-react next-auth @prisma/client
```

### **2. Database Schema**

Make sure your Prisma schema includes:

```prisma
model Task {
  id          String   @id @default(cuid())
  title       String
  description String
  status      String   @default("pending")
  priority    String   @default("medium")
  dueDate     DateTime?
  assignedToId String
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  assignedTo   User @relation("UserTasks", fields: [assignedToId], references: [id])
  creator      User @relation("CreatedTasks", fields: [createdBy], references: [id])
  attachments  TaskAttachment[]
  project      Project? @relation(fields: [projectId], references: [id])

  @@map("tasks")
}

model TaskAttachment {
  id     String @id @default(cuid())
  name   String
  type   String
  url    String
  taskId String

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@map("task_attachments")
}

model User {
  id        String    @id @default(cuid())
  name      String?
  email     String    @unique
  role      String    @default("user")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  tasksCreated Task[] @relation("CreatedTasks")
  tasksAssigned Task[] @relation("UserTasks")

  @@map("users")
}
```

### **3. Environment Variables**

```env
# Cloudinary for file uploads
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Database
DATABASE_URL=your_database_url

# NextAuth
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

## 🎯 Usage Examples

### **Basic Dashboard Implementation**

```tsx
import { RoleBasedTaskDashboard } from '@/components/dashboard/RoleBasedTaskDashboard';

export default function UserTasksPage() {
  return (
    <div className="container mx-auto p-6">
      <RoleBasedTaskDashboard />
    </div>
  );
}
```

### **Task Creation with PDF Upload**

```tsx
import { TaskCreationForm } from '@/components/tasks/TaskCreationForm';

export default function CreateTaskPage() {
  const handleTaskCreated = (newTask) => {
    console.log('Task created:', newTask);
    // Redirect or update UI
  };

  return (
    <div className="container mx-auto p-6">
      <TaskCreationForm 
        onTaskCreated={handleTaskCreated}
        assignedToId="user-id-here"
      />
    </div>
  );
}
```

### **PDF Viewer Standalone**

```tsx
import { PDFViewer } from '@/components/ui/PDFViewer';

export default function PDFDisplayPage() {
  return (
    <div className="container mx-auto p-6">
      <PDFViewer
        url="https://example.com/document.pdf"
        title="Sample Document"
        showControls={true}
        allowDownload={true}
      />
    </div>
  );
}
```

## 🔧 Configuration

### **Role-Based Access Control**

The system supports these roles:
- **admin** - Can see all tasks
- **manager** - Can see tasks in their department
- **user** - Can only see their own assigned tasks

### **PDF Upload Configuration**

1. **Cloudinary Setup:**
   - Create a Cloudinary account
   - Create an upload preset named `task_attachments`
   - Configure allowed file types (PDF, DOC, DOCX)
   - Set max file size to 10MB

2. **File Type Validation:**
   ```tsx
   const allowedTypes = [
     'application/pdf',
     'application/msword',
     'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
   ];
   ```

### **Task Status Workflow**

```tsx
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Users can only advance their own tasks forward
const statusTransitions = {
  pending: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [], // Terminal state
  cancelled: ['pending'], // Can be reopened
};
```

## 🎨 Customization

### **Custom Priority Levels**

```tsx
// In PrioritySelector.tsx
const priorities = [
  {
    value: 'low',
    label: 'Low Priority',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: <Flag className="w-4 h-4" />
  },
  // Add custom priorities...
];
```

### **Custom Status Options**

```tsx
// In TaskStatusSelector.tsx
const statuses = [
  {
    value: 'pending',
    label: 'Awaiting Action',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: <Clock className="w-4 h-4" />
  },
  // Add custom statuses...
];
```

### **PDF Viewer Customization**

```tsx
<PDFViewer
  url={pdfUrl}
  title={pdfTitle}
  className="h-96" // Custom height
  showControls={true} // Hide/show controls
  allowDownload={false} // Disable download
/>
```

## 🔐 Security Considerations

### **Authentication**
- All API routes require NextAuth session
- Users can only access their own tasks
- Admin/manager roles have elevated permissions

### **File Upload Security**
- File type validation on both client and server
- File size limits (10MB max)
- Cloudinary provides secure file storage
- PDFs displayed in sandboxed iframes

### **Data Validation**
- Input sanitization for all form fields
- SQL injection prevention via Prisma
- XSS protection through proper escaping

## 📱 Mobile Responsiveness

All components are mobile-first responsive:

- **Dashboard** - Adapts to small screens with stacked layouts
- **PDF Viewer** - Fullscreen mode for mobile viewing
- **Task Forms** - Touch-friendly controls and inputs
- **Selectors** - Optimized dropdowns for mobile

## 🚀 Performance Optimization

### **Lazy Loading**
- PDFs load on demand
- Tasks paginated for large datasets
- Images optimized with next/image

### **Caching**
- API responses cached with React Query
- PDFs cached in browser storage
- Static assets served via CDN

### **Bundle Optimization**
- Components code-split by route
- PDF viewer loaded only when needed
- Tree-shaking for unused icons

## 🐛 Troubleshooting

### **Common Issues**

1. **Tasks not loading**
   - Check user authentication
   - Verify database connection
   - Check API route permissions

2. **PDF upload failing**
   - Verify Cloudinary configuration
   - Check file size limits
   - Ensure proper file types

3. **Status updates not working**
   - Check user permissions
   - Verify task ownership
   - Check API route implementation

### **Debug Mode**

Enable debug logging:

```tsx
// In development
const { userTasks, loading, error } = useRoleBasedTasks();

if (error) {
  console.error('Task loading error:', error);
}
```

## 🎯 Best Practices

1. **Always validate file uploads** on both client and server
2. **Implement proper error boundaries** for better UX
3. **Use loading states** for better perceived performance
4. **Test role-based access** thoroughly
5. **Implement proper logging** for security auditing

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Test with different user roles
4. Verify Cloudinary configuration

---

**Built with 🐧 Penguin-Alpha - Premium Task Management Solutions**
