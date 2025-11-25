# MongoDB Data Display Setup Guide

This guide ensures that any data you add in MongoDB Compass will be automatically displayed in your project.

## 📋 Prerequisites

1. **MongoDB Compass** is installed and connected to your database
2. **Next.js dev server** is running (`npm run dev`)
3. **Environment variables** are configured in `.env.local`

## 🗄️ MongoDB Connection Details

Your project is connected to:
- **Database**: `charity`
- **Cluster**: `cluster0.t9f9zti.mongodb.net`
- **Connection String**: `mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity`

## 📝 Data Structure

### Projects Collection
```javascript
{
  "_id": ObjectId("..."),
  "bannerPhotoUrl": "https://example.com/image.jpg",
  "gallery": ["mediaId1", "mediaId2"],
  "created_at": "2025-01-01T00:00:00.000Z",
  "contents": [
    {
      "language_code": "en",
      "name": "Project Name",
      "description": "Project description",
      "content": "Full project content",
      "images": ["mediaId3"],
      "videos": ["mediaId4"],
      "documents": ["mediaId5"]
    },
    {
      "language_code": "ar",
      "name": "اسم المشروع",
      "description": "وصف المشروع",
      "content": "محتوى المشروع الكامل",
      "images": [],
      "videos": [],
      "documents": []
    }
  ]
}
```

### Media Collection
```javascript
{
  "_id": ObjectId("..."),
  "filename": "unique_filename.jpg",
  "originalName": "my-photo.jpg",
  "mimeType": "image/jpeg",
  "size": 1024000,
  "url": "/uploads/unique_filename.jpg",
  "uploaded_at": "2025-01-01T00:00:00.000Z"
}
```

## 🚀 Quick Start

### Option 1: Add Sample Data (Recommended)
Run the seeding script to add sample projects:

```bash
# Add sample projects
node seed-projects.js

# Clear existing data and add fresh samples
node seed-projects.js --clear
```

### Option 2: Add Data Manually in MongoDB Compass

1. **Open MongoDB Compass**
2. **Connect to your cluster** using the connection string above
3. **Select the `charity` database**
4. **Add projects to the `project` collection**

**Manual Project Example:**
```javascript
{
  "bannerPhotoUrl": "https://images.unsplash.com/photo-1579532584362-d26a8d349ee6?w=800",
  "gallery": [],
  "created_at": new Date(),
  "contents": [
    {
      "language_code": "en",
      "name": "My New Project",
      "description": "A description of my project",
      "content": "Full content about my amazing project...",
      "images": [],
      "videos": [],
      "documents": []
    }
  ]
}
```

## 🧪 Test Your Setup

### 1. Test API Endpoints
```bash
# Test all projects API
node test-projects-api.js

# Or manually test:
curl http://localhost:3000/api/projects
```

### 2. Check Browser
1. Start dev server: `npm run dev`
2. Open: `http://localhost:3000/en/projects`
3. Open: `http://localhost:3000/ar/projects`

## 🔄 Real-time Updates

Any changes you make in MongoDB Compass will **automatically appear** in your project:

1. **Add a new project** → Appears in project listing
2. **Update project details** → Changes reflected immediately
3. **Add media files** → Displayed in project galleries
4. **Delete a project** → Removed from listing

## 🎯 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET | Get all projects |
| `/api/projects/[id]` | GET | Get single project |
| `/api/projects` | POST | Create new project |
| `/api/projects/[id]` | PATCH | Update project |
| `/api/projects/[id]` | DELETE | Delete project |
| `/api/media` | GET | Get all media files |
| `/api/media` | POST | Upload media files |

## 🐛 Troubleshooting

### Projects Not Showing?
1. **Check MongoDB Connection**: Ensure Compass is connected
2. **Verify Data Structure**: Use the schema above
3. **Check Console**: Look for error messages in browser dev tools
4. **Test API**: Run the test script to verify endpoints

### Images Not Loading?
1. **Check URL Format**: Use full URLs or `/uploads/filename.jpg`
2. **Verify Media Collection**: Ensure media files exist in database
3. **Check File Permissions**: Ensure uploads directory exists

### Multilingual Issues?
1. **Add Both Languages**: Include both `en` and `ar` content
2. **Check Language Code**: Use exact `language_code` values
3. **Verify Routing**: Check locale in URL (`/en/projects` vs `/ar/projects`)

## 📱 Expected Results

After setup, you should see:
- ✅ Projects listed on `/projects` page
- ✅ Banner images displayed
- ✅ Project details on individual pages
- ✅ Media galleries (if images/videos added)
- ✅ Both English and Arabic content
- ✅ Real-time updates from MongoDB

## 🎉 Success Indicators

When everything is working:
- Console shows: `✅ Retrieved X projects from MongoDB`
- Projects display with images and descriptions
- Both English and Arabic versions work
- Any new data in Compass appears immediately

---

**Need Help?** Check the console logs and run the test script to diagnose issues.
