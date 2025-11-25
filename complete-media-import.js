// Complete import of ALL media, videos, and content from charity-backend CSV files
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

// Parse CSV data with proper handling of quoted fields
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] ? values[index].replace(/"/g, '') : '';
    });
    return obj;
  });
}

// Convert Google Drive URL to direct display URL
function convertGoogleDriveURL(url) {
  if (!url || !url.includes('drive.google.com')) return url;
  
  // Handle different Google Drive URL formats
  if (url.includes('/file/d/')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  } else if (url.includes('open?id=')) {
    const match = url.match(/open\?id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }
  
  return url;
}

async function completeMediaImport() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    // Read all CSV files
    const csvPath = 'c:/Users/yassi/Downloads/hope-bridge-main/hope-bridge-main/charity-backend/dist/db/projects';
    
    const posts = parseCSV(path.join(csvPath, 'post.csv'));
    const contents = parseCSV(path.join(csvPath, 'post_content.csv'));
    const media = parseCSV(path.join(csvPath, 'post_media.csv'));
    
    console.log(`📊 Found ${posts.length} posts, ${contents.length} contents, ${media.length} media files\n`);
    
    // Filter only project posts
    const projectPosts = posts.filter(post => post.category === 'project');
    console.log(`🎯 Project posts: ${projectPosts.length}\n`);
    
    const Project = mongoose.connection.db.collection('project');
    
    // Clear existing projects
    await Project.deleteMany({});
    console.log('🗑️ Cleared existing projects\n');
    
    let importedCount = 0;
    let totalImages = 0;
    let totalVideos = 0;
    
    for (const post of projectPosts) {
      console.log(`\n🔄 Processing project: ${post.id}`);
      
      // Get content for this post
      const postContents = contents.filter(content => content.post_id === post.id);
      console.log(`   📝 Found ${postContents.length} content entries`);
      
      // Get ALL media for this post
      const postMedia = media.filter(m => m.post_id === post.id);
      console.log(`   🖼️ Found ${postMedia.length} media files`);
      
      // Separate images and videos
      const images = postMedia.filter(m => m.type === 'img').map(m => convertGoogleDriveURL(m.url));
      const videos = postMedia.filter(m => m.type === 'video').map(m => convertGoogleDriveURL(m.url));
      
      console.log(`   📸 Images: ${images.length}`);
      console.log(`   🎥 Videos: ${videos.length}`);
      
      // Find banner image (first image)
      const bannerImage = images.length > 0 ? images[0] : "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800";
      
      // Create project contents with ALL media
      const projectContents = postContents.map(content => ({
        language_code: content.language_code,
        name: content.name || 'Untitled Project',
        description: content.description || '',
        content: content.content || '',
        images: images, // ALL images for this project
        videos: videos, // ALL videos for this project
        documents: []
      }));
      
      // Create project document
      const projectData = {
        _id: new mongoose.Types.ObjectId(),
        bannerPhotoUrl: bannerImage,
        gallery: images.slice(1), // All images except banner as gallery
        created_at: new Date(post.created_at),
        contents: projectContents
      };
      
      // Insert project
      await Project.insertOne(projectData);
      
      console.log(`   ✅ Imported: ${postContents[0]?.name || 'Unknown'}`);
      
      importedCount++;
      totalImages += images.length;
      totalVideos += videos.length;
    }
    
    console.log(`\n🎉 Complete Import Summary:`);
    console.log(`   📁 Projects imported: ${importedCount}`);
    console.log(`   📸 Total images: ${totalImages}`);
    console.log(`   🎥 Total videos: ${totalVideos}`);
    console.log(`   🖼️ Average media per project: ${Math.round((totalImages + totalVideos) / importedCount)}`);
    
    console.log('\n💡 All media and videos from your charity-backend are now imported!');
    console.log('🔄 Restart your dev server to see all the media in your projects');
    console.log('🌐 Visit: http://localhost:3000/en/projects');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('📥 Complete Media Import from Charity-Backend\n');
console.log('This will import ALL projects, content, images, and videos from your CSV files.\n');

completeMediaImport();
