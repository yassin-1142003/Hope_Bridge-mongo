# ⚡ Quick Start Guide - Task Management System

Get your task management system running in under 5 minutes!

## 🚀 **Step 1: Start MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

## 🚀 **Step 2: Start Backend**
```bash
cd task-manager-backend

# Install dependencies (first time only)
npm install

# Set up environment
cp .env.example .env

# Start server
npm run dev
```
✅ Backend running on `http://localhost:5000`

## 🚀 **Step 3: Start Frontend**
```bash
cd task-manager-frontend

# Start with any of these options:
# Option 1: Python (if installed)
python -m http.server 3000

# Option 2: Node.js serve
npx serve -p 3000

# Option 3: live-server
npx live-server --port=3000
```
✅ Frontend running on `http://localhost:3000`

## 🚀 **Step 4: Use the System**

1. **Open Browser** → `http://localhost:3000`
2. **Register Account** → Create manager and employee accounts
3. **Login** → Use any registered account
4. **Send Tasks** → Create and assign tasks to users
5. **Manage Tasks** → Update status, view details, download attachments

## 🎯 **Test the System**

### **Create Test Users:**
1. **Manager Account:**
   - Name: "Manager User"
   - Email: "manager@test.com"
   - Password: "password123"
   - Role: "Manager"

2. **Employee Account:**
   - Name: "Employee User"
   - Email: "employee@test.com"
   - Password: "password123"
   - Role: "Employee"

### **Test Workflow:**
1. Login as Manager
2. Send task to Employee
3. Logout and login as Employee
4. View received task
5. Update task status
6. Switch back to Manager to see updates

## 🔧 **Troubleshooting**

### **Backend Issues:**
- **MongoDB Connection Error**: Make sure MongoDB is running
- **Port 5000 in use**: Change PORT in .env file
- **Module not found**: Run `npm install` again

### **Frontend Issues:**
- **CORS errors**: Backend must be running first
- **Port 3000 in use**: Use different port (3001, 8080, etc.)
- **File not found**: Make sure you're in the correct directory

### **Common Issues:**
- **Login fails**: Check email/password are correct
- **Tasks not showing**: Refresh page or wait 10 seconds for auto-refresh
- **File upload fails**: Check file size (max 5MB) and type

## 📱 **Mobile Access**

The system is fully responsive! Access from any device:
- Phone: `http://your-ip:3000`
- Tablet: Works perfectly
- Desktop: Full-featured experience

## 🎉 **You're Ready!**

Your task management system is now running with:
- ✅ User authentication
- ✅ Task creation and management
- ✅ File attachments
- ✅ Real-time updates
- ✅ Professional UI
- ✅ Mobile support

**Start managing tasks efficiently!** 🚀
