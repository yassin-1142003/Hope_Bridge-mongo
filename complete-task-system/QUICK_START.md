# ⚡ Quick Start Guide

Get your Complete Task Management System running in minutes!

## 🚀 5-Minute Setup

### 1. Prerequisites
- ✅ Node.js 16+ installed
- ✅ MongoDB running (local or cloud)
- ✅ Terminal/Command Prompt

### 2. Backend Setup (2 minutes)

```bash
# Navigate to backend folder
cd complete-task-system/backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env  # Windows
# or
cp .env.example .env    # Mac/Linux

# Edit .env file (notepad .env on Windows)
# Set these values:
# MONGO_URI=mongodb://localhost:27017/complete-task-system
# JWT_SECRET=your-secret-key-here
# FRONTEND_URL=http://localhost:3000

# Start backend server
npm run dev
```

**Backend is now running on:** `http://localhost:5000`

### 3. Frontend Setup (1 minute)

```bash
# Open new terminal window
cd complete-task-system/frontend

# Start with Python (easiest)
python -m http.server 3000

# OR with Node.js
npx serve -p 3000

# OR use VS Code Live Server extension
```

**Frontend is now running on:** `http://localhost:3000`

### 4. Test the System (2 minutes)

1. **Open Browser:** Go to `http://localhost:3000`
2. **Register:** Create your first account
3. **Login:** Use your credentials
4. **Create Task:** Click "Create Task" button
5. **Test Chat:** Click chat icon in bottom-right

## 🎯 Quick Test Steps

### Test Task Management
1. **Create Task:**
   - Title: "Test Task"
   - Description: "This is a test task"
   - Assign to yourself (or create another user)
   - Click "Create Task"

2. **Update Status:**
   - Click "Show" on your task
   - Click status buttons (Pending → In Progress → Completed)

3. **Add Comment:**
   - In task details, add a comment
   - See it appear instantly

### Test Chat System
1. **Open Chat:** Click chat icon (💬) bottom-right
2. **Select User:** Choose a user from the list
3. **Send Message:** Type "Hello!" and send
4. **Test Emoji:** Click emoji button, add reaction
5. **Test Typing:** Type and see typing indicator

### Test Real-time Features
1. **Open Two Browser Windows:**
   - Window 1: Login as User A
   - Window 2: Login as User B

2. **Test Real-time Updates:**
   - User A creates task → User B sees notification
   - User A sends chat → User B receives instantly
   - User A updates task status → User B sees change

## 🔧 Common Issues & Solutions

### ❌ "MongoDB Connection Failed"
**Solution:** 
1. Make sure MongoDB is running: `mongod`
2. Check your MONGO_URI in .env file
3. Verify MongoDB is on port 27017

### ❌ "JWT Secret Required"
**Solution:**
1. Open `.env` file
2. Set `JWT_SECRET=any-random-string-here`
3. Restart backend server

### ❌ "Frontend Not Loading"
**Solution:**
1. Make sure backend is running on port 5000
2. Check frontend is running on port 3000
3. Try refreshing the page

### ❌ "CORS Error"
**Solution:**
1. Check `FRONTEND_URL=http://localhost:3000` in .env
2. Restart backend server
3. Make sure both URLs match

### ❌ "File Upload Not Working"
**Solution:**
1. Check `uploads` folder exists in backend
2. Verify file size is under 5MB
3. Make sure file type is allowed

## 🎮 Demo Users (Optional)

Want to skip registration? Create these test users:

```bash
# User 1: Admin
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@test.com","password":"123456","role":"admin"}'

# User 2: Manager  
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Manager User","email":"manager@test.com","password":"123456","role":"manager"}'

# User 3: Employee
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Employee User","email":"employee@test.com","password":"123456","role":"employee"}'
```

Now login with:
- **Email:** admin@test.com, manager@test.com, employee@test.com
- **Password:** 123456

## 📱 Mobile Testing

The system works on mobile! Test it:

1. **Phone Browser:** Open `http://localhost:3000`
2. **Responsive Design:** Should adapt to screen size
3. **Touch Interface:** All buttons work with touch
4. **Chat on Mobile:** Slide-out chat works perfectly

## 🔍 Verification Checklist

✅ **Backend Running:** `http://localhost:5000/health` returns success  
✅ **Frontend Loading:** `http://localhost:3000` shows login page  
✅ **User Registration:** Can create new account  
✅ **User Login:** Can login with credentials  
✅ **Task Creation:** Can create and assign tasks  
✅ **Task Updates:** Can change task status  
✅ **Chat System:** Can send/receive messages  
✅ **Real-time Updates:** Changes appear instantly  
✅ **File Upload:** Can attach files to tasks  
✅ **Notifications:** See alerts for new tasks  

## 🎯 Next Steps

Once everything is working:

1. **Explore Features:**
   - Create multiple tasks
   - Test user roles
   - Try file attachments
   - Explore chat features

2. **Advanced Testing:**
   - Open multiple browser windows
   - Test simultaneous users
   - Test file sharing in chat
   - Test task comments

3. **Customization:**
   - Edit CSS colors in dashboard.css
   - Modify task priorities
   - Add custom tags
   - Customize notification sounds

## 🆘 Need Help?

If something doesn't work:

1. **Check Console:** Open browser DevTools (F12)
2. **Check Backend:** Look at terminal for errors
3. **Check MongoDB:** Make sure it's running
4. **Restart Everything:** Stop both servers and restart
5. **Check .env:** Verify all environment variables

## 🎉 Success!

If you completed all the steps, you now have:
- ✅ **Full Task Management System**
- ✅ **Real-time Chat**  
- ✅ **User Authentication**
- ✅ **File Sharing**
- ✅ **Notifications**
- ✅ **Mobile Support**

**Congratulations!** 🎉 Your task management system is ready for production use!

---

**Pro Tip:** Bookmark this guide for future reference. The system scales to hundreds of users and thousands of tasks!
