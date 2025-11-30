# MongoDB Database Initialization

This guide will help you set up MongoDB with proper schemas and sample data for the HopeBridge dashboard.

## 🎯 What This Does

- **Creates MongoDB collections** with proper schema validation
- **Sets up performance indexes** for fast queries
- **Inserts sample data** to test the dashboard functionality
- **Resolves dashboard MongoDB issues** by providing proper data structure

## 📋 Prerequisites

1. **MongoDB must be running** on your system
2. **Node.js and npm** installed
3. **Environment configured** with MongoDB connection string

## 🚀 Quick Start

### Option 1: Run with Simple Script (Recommended)

```bash
node init-db.js
```

### Option 2: Run Directly with tsx

```bash
cd scripts
npx tsx init-database.ts
```

### Option 3: Install Dependencies and Run

```bash
cd scripts
npm install
npm run init
```

## 🔧 Configuration

The script uses these environment variables:

- `MONGODB_URI`: MongoDB connection string (default: `mongodb://localhost:27017`)
- `DB_NAME`: Database name (default: `hopebridge`)

You can set these in your `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017
DB_NAME=hopebridge
```

## 📊 What Gets Created

### Collections

- **users**: User accounts with roles and permissions
- **tasks**: Task management with assignments and progress tracking
- **projects**: Project management with team members and milestones
- **notifications**: User notifications and alerts
- **activity**: Activity logging and audit trail

### Sample Data

- **3 sample users** (Admin, Coordinator, Field Officer)
- **2 sample projects** (School Renovation, Healthcare Camp)
- **3 sample tasks** with different statuses
- **Sample notifications** for testing

### Indexes

- **Performance indexes** for fast queries
- **Unique indexes** for email addresses
- **Compound indexes** for common query patterns

## ✅ Verification

After successful initialization, you should see:

```text
📊 Database Statistics:
  Users: 3
  Tasks: 3
  Projects: 2
  Notifications: 2
```

## 🎯 Next Steps

1. **Restart development server**: `npm run dev`
2. **Navigate to dashboard**: `/en/dashboard/tasks`
3. **Test functionality**: Create, update, and delete tasks
4. **Verify data persistence**: Check MongoDB directly

## 🛠️ Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongod

# Test connection
mongosh mongodb://localhost:27017
```

### Permission Issues

```bash
# Make sure MongoDB user has create permissions
mongosh
use admin
db.createUser({user: "admin", pwd: "password", roles: ["root"]})
```

### TypeScript Errors

```bash
# Install tsx globally
npm install -g tsx

# Or install locally
npm install tsx
```

## 📁 File Structure

```text
├── lib/mongodb/schemas.ts     # Schema definitions and setup functions
├── scripts/init-database.ts   # Main initialization script
├── scripts/package.json       # Script dependencies
└── init-db.js                # Simple runner script
```

## 🎉 Success Indicators

✅ **No TypeScript errors** during compilation

✅ **MongoDB collections created** successfully

✅ **Sample data inserted** without errors

✅ **Dashboard loads** with real data

✅ **Task management** works correctly

## 📞 Support

If you encounter issues:

1. **Check console logs** for detailed error messages
2. **Verify MongoDB is running** and accessible
3. **Ensure environment variables** are set correctly
4. **Restart MongoDB** if connection issues persist

---

**🚀 Once initialized, your HopeBridge dashboard will work perfectly with MongoDB!**
