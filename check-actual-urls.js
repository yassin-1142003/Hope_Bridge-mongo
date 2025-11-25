// Check the actual URL formats in the database
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function checkActualUrls() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).limit(2).toArray();
    
    console.log('🔍 Checking Actual URL Formats\n');
    
    for (const project of projects) {
      const englishContent = project.contents?.find(c => c.language_code === 'en');
      const projectName = englishContent?.name || 'Unknown';
      
      console.log(`📁 Project: ${projectName}`);
      console.log(`   🆔 ID: ${project._id}`);
      
      // Check banner URL
      console.log(`   🖼️ Banner URL: ${project.bannerPhotoUrl}`);
      console.log(`      🔍 Contains 'thumbnail': ${project.bannerPhotoUrl.includes('thumbnail')}`);
      console.log(`      🔍 Contains 'export=view': ${project.bannerPhotoUrl.includes('export=view')}`);
      console.log(`      🔍 Contains 'export=download': ${project.bannerPhotoUrl.includes('export=download')}`);
      
      // Check gallery URLs
      const galleryCount = project.gallery?.length || 0;
      console.log(`   🖼️ Gallery Count: ${galleryCount}`);
      
      if (galleryCount > 0) {
        const sampleGalleryUrl = project.gallery[0];
        console.log(`   📷 Sample Gallery URL: ${sampleGalleryUrl}`);
        console.log(`      🔍 Contains 'thumbnail': ${sampleGalleryUrl.includes('thumbnail')}`);
        console.log(`      🔍 Contains 'export=view': ${sampleGalleryUrl.includes('export=view')}`);
        console.log(`      🔍 Contains 'export=download': ${sampleGalleryUrl.includes('export=download')}`);
      }
      
      // Check content images
      const imageCount = englishContent?.images?.length || 0;
      console.log(`   📸 Content Images Count: ${imageCount}`);
      
      if (imageCount > 0) {
        const sampleImageUrl = englishContent.images[0];
        console.log(`   📷 Sample Content URL: ${sampleImageUrl}`);
        console.log(`      🔍 Contains 'thumbnail': ${sampleImageUrl.includes('thumbnail')}`);
        console.log(`      🔍 Contains 'export=view': ${sampleImageUrl.includes('export=view')}`);
        console.log(`      🔍 Contains 'export=download': ${sampleImageUrl.includes('export=download')}`);
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

console.log('🔍 Checking Actual URL Formats\n');
console.log('This will show the exact URL formats in the database.\n');

checkActualUrls();
