// Check video URLs and formats in the database
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function checkVideos() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).toArray();
    
    console.log('🎥 Checking Video URLs and Formats\n');
    
    let totalVideos = 0;
    let videoProjects = 0;
    
    for (const project of projects) {
      const englishContent = project.contents?.find(c => c.language_code === 'en');
      const projectName = englishContent?.name || 'Unknown';
      
      // Check videos in content
      const videos = englishContent?.videos || [];
      if (videos.length > 0) {
        videoProjects++;
        console.log(`📁 Project: ${projectName}`);
        console.log(`   🎥 Videos: ${videos.length}`);
        
        videos.forEach((videoUrl, index) => {
          console.log(`   📹 Video ${index + 1}: ${videoUrl.substring(0, 60)}...`);
          
          // Test URL format
          const isDriveUrl = videoUrl.includes('drive.google.com');
          const hasFileId = videoUrl.match(/id=([a-zA-Z0-9_-]+)/);
          
          console.log(`      ✅ Google Drive: ${isDriveUrl ? 'YES' : 'NO'}`);
          console.log(`      ✅ Has File ID: ${hasFileId ? 'YES' : 'NO'}`);
          
          if (hasFileId) {
            const embedUrl = `https://drive.google.com/file/d/${hasFileId[1]}/preview`;
            console.log(`      🎯 Embed URL: ${embedUrl.substring(0, 60)}...`);
          }
        });
        
        totalVideos += videos.length;
        console.log('');
      }
    }
    
    console.log('📊 Video Summary:');
    console.log(`   🎥 Projects with Videos: ${videoProjects}/10`);
    console.log(`   📹 Total Videos: ${totalVideos}`);
    
    if (totalVideos > 0) {
      console.log('\n🔧 Video Optimization Needed:');
      console.log('   • Convert all video URLs to embed format');
      console.log('   • Ensure proper iframe display');
      console.log('   • Add video thumbnails');
    } else {
      console.log('\nℹ️ No videos found in projects');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🎥 Checking Video URLs and Formats\n');
console.log('This will analyze all video URLs in your projects.\n');

checkVideos();
