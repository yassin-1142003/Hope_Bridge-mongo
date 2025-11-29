// MongoDB Project Structure with Images and Videos
// This shows exactly how the data will look in MongoDB

console.log(`
🗄️ MONGODB PROJECT STRUCTURE WITH IMAGES & VIDEOS
=================================================

📊 COLLECTION: projects
📄 DOCUMENT STRUCTURE:

{
  "_id": ObjectId("656a1b2c3d4e5f6a7b8c9d0e"),
  "title": "Community Garden Project",
  "description": "Transforming unused spaces into thriving community gardens",
  "shortDescription": "Urban gardening initiative",
  "status": "active",
  "category": "community",
  "featured": true,
  "createdAt": ISODate("2024-11-29T10:00:00.000Z"),
  "updatedAt": ISODate("2024-11-29T10:00:00.000Z"),
  
  🌄 "bannerPhotoUrl": "/uploads/community-garden-banner.jpg",
  
  📸 "images": [
    "/uploads/garden-team-photo.jpg",
    "/uploads/garden-harvest.jpg", 
    "/uploads/garden-ceremony.jpg"
  ],
  
  🖼️ "gallery": [
    {
      "id": "img_001",
      "url": "/uploads/garden-before.jpg",
      "alt": "Garden space before transformation",
      "caption": "Before we started"
    },
    {
      "id": "img_002",
      "url": "/uploads/garden-during.jpg", 
      "alt": "Volunteers working in garden",
      "caption": "Community volunteers at work"
    },
    {
      "id": "img_003",
      "url": "/uploads/garden-after.jpg",
      "alt": "Completed community garden", 
      "caption": "Beautiful results"
    }
  ],
  
  🎥 "videos": [
    {
      "id": "vid_001",
      "url": "/uploads/garden-timelapse.mp4",
      "thumbnail": "/uploads/garden-timelapse-thumb.jpg",
      "title": "Garden Transformation Timelapse",
      "duration": "2:30",
      "description": "Watch our garden grow from start to finish"
    },
    {
      "id": "vid_002", 
      "url": "/uploads/volunteer-testimonials.mp4",
      "thumbnail": "/uploads/testimonials-thumb.jpg",
      "title": "Volunteer Stories",
      "duration": "4:15",
      "description": "Hear from our amazing volunteers"
    }
  ],
  
  📊 "mediaCount": {
    "images": 6,
    "videos": 2,
    "total": 8
  },
  
  📍 "location": "Downtown Community Center",
  📅 "startDate": ISODate("2024-03-01T00:00:00.000Z"),
  📅 "completionDate": ISODate("2024-06-01T00:00:00.000Z"),
  👥 "volunteers": 45,
  💡 "impact": "Served 200+ families with fresh produce"
}

🎯 DIFFERENT IMAGE STORAGE APPROACHES:

1️⃣ SIMPLE STRING ARRAY (for basic images):
   "images": ["image1.jpg", "image2.jpg", "image3.jpg"]

2️⃣ DETAILED OBJECT ARRAY (for gallery with metadata):
   "gallery": [{
     "id": "img_001",
     "url": "/uploads/photo.jpg", 
     "alt": "Description for accessibility",
     "caption": "Display caption",
     "category": "before-after"
   }]

3️⃣ SINGLE BANNER IMAGE:
   "bannerPhotoUrl": "/uploads/banner.jpg"

4️⃣ VIDEO OBJECTS WITH THUMBNAILS:
   "videos": [{
     "id": "vid_001",
     "url": "/uploads/video.mp4",
     "thumbnail": "/uploads/thumb.jpg",
     "title": "Video Title",
     "duration": "2:30",
     "description": "Video description"
   }]

🔍 HOW THE ENHANCED API USES THIS:

When you call /api/projects, the API will:
1. Fetch projects from the 'projects' collection
2. Fetch media from the 'media' collection  
3. Combine them like this:

{
  // Original project data
  title: "Community Garden Project",
  images: ["/uploads/garden-team-photo.jpg"], // From project
  
  // Enhanced with media collection data
  enrichedImages: [    // From media collection
    {
      id: "656a1b2c...",
      title: "Garden Photo",
      url: "/uploads/garden-photo.jpg",
      type: "image",
      category: "project"
    }
  ],
  enrichedVideos: [...], // From media collection
  allMedia: [...]       // Combined images + videos
}

📁 FILE STORAGE STRUCTURE:
/public/uploads/
├── community-garden-banner.jpg
├── garden-before.jpg
├── garden-during.jpg  
├── garden-after.jpg
├── garden-timelapse.mp4
├── garden-timelapse-thumb.jpg
└── ...

🗄️ COLLECTIONS IN MONGODB:

1. projects - Project documents with image arrays
2. media   - Individual media files with metadata

This structure gives you:
✅ Fast queries (arrays in project docs)
✅ Rich metadata (detailed objects)
✅ Flexible organization (categories, types)
✅ Easy API enhancement (combine collections)
✅ Scalable storage (separate media collection)
`);

console.log('🎉 MongoDB structure visualization complete!');
console.log('📝 Run this script to see the structure examples');
console.log('🚀 When MongoDB is running, use insert-sample-projects.js to add real data');
