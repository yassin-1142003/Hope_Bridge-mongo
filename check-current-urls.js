// Check what URLs are actually being used now
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function checkCurrentUrls() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).limit(2).toArray();
    
    console.log('🔍 Checking Current URL Formats\n');
    
    for (const project of projects) {
      const englishContent = project.contents?.find(c => c.language_code === 'en');
      const projectName = englishContent?.name || 'Unknown';
      
      console.log(`📁 Project: ${projectName}`);
      console.log(`   🖼️ Banner: ${project.bannerPhotoUrl}`);
      console.log(`      ✅ Is Thumbnail: ${project.bannerPhotoUrl.includes('thumbnail') ? 'YES' : 'NO'}`);
      
      // Check gallery URLs
      const galleryCount = project.gallery?.length || 0;
      console.log(`   🖼️ Gallery Count: ${galleryCount}`);
      
      if (galleryCount > 0) {
        const sampleGalleryUrl = project.gallery[0];
        console.log(`   📷 Sample Gallery: ${sampleGalleryUrl}`);
        console.log(`      ✅ Is Thumbnail: ${sampleGalleryUrl.includes('thumbnail') ? 'YES' : 'NO'}`);
      }
      
      // Check content images
      const imageCount = englishContent?.images?.length || 0;
      console.log(`   📸 Content Images Count: ${imageCount}`);
      
      if (imageCount > 0) {
        const sampleImageUrl = englishContent.images[0];
        console.log(`   📷 Sample Content: ${sampleImageUrl}`);
        console.log(`      ✅ Is Thumbnail: ${sampleImageUrl.includes('thumbnail') ? 'YES' : 'NO'}`);
      }
      
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🔍 Checking Current URL Formats\n');
console.log('This will verify if URLs are actually converted to thumbnails.\n');

checkCurrentUrls();
