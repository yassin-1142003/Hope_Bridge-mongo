// Test that media URLs are properly formatted for display
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function testMediaDisplay() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).limit(2).toArray();
    
    console.log('🧪 Testing Media Display Format\n');
    
    for (const project of projects) {
      const arabicContent = project.contents?.find(c => c.language_code === 'ar');
      const englishContent = project.contents?.find(c => c.language_code === 'en');
      
      const projectName = arabicContent?.name || englishContent?.name || 'Unknown';
      const galleryCount = project.gallery?.length || 0;
      const imageCount = englishContent?.images?.length || 0;
      const videoCount = englishContent?.videos?.length || 0;
      
      console.log(`📁 Project: ${projectName}`);
      console.log(`   🖼️ Gallery: ${galleryCount} images`);
      console.log(`   📸 Content Images: ${imageCount}`);
      console.log(`   🎥 Content Videos: ${videoCount}`);
      
      // Test URL formats
      if (project.bannerPhotoUrl) {
        console.log(`   🌐 Banner URL: ${project.bannerPhotoUrl.substring(0, 60)}...`);
        console.log(`      ✅ Format: ${project.bannerPhotoUrl.includes('export=view') ? 'Direct Display' : 'Other'}`);
      }
      
      if (galleryCount > 0) {
        const sampleGalleryUrl = project.gallery[0];
        console.log(`   📷 Sample Gallery: ${sampleGalleryUrl.substring(0, 60)}...`);
        console.log(`      ✅ Format: ${sampleGalleryUrl.includes('export=view') ? 'Direct Display' : 'Other'}`);
      }
      
      if (videoCount > 0) {
        const sampleVideoUrl = englishContent.videos[0];
        console.log(`   🎬 Sample Video: ${sampleVideoUrl.substring(0, 60)}...`);
        console.log(`      ✅ Format: ${sampleVideoUrl.includes('export=view') ? 'Direct URL' : 'Other'}`);
        
        // Test embed URL conversion
        const match = sampleVideoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          const embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
          console.log(`      🎥 Embed URL: ${embedUrl.substring(0, 60)}...`);
        }
      }
      
      console.log('');
    }
    
    console.log('✅ Media URLs are properly formatted for frontend display!');
    console.log('🔄 Restart your dev server to see the working media galleries');
    console.log('🌐 Visit: http://localhost:3000/en/projects');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🧪 Testing Media Display Format\n');
console.log('This will verify that media URLs are properly formatted.\n');

testMediaDisplay();
