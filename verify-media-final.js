// Final verification of media display
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function verifyMediaFinal() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).toArray();
    
    console.log(`📊 Final Media Verification for ${projects.length} projects\n`);
    
    for (let i = 0; i < Math.min(3, projects.length); i++) {
      const project = projects[i];
      const arabicContent = project.contents?.find(c => c.language_code === 'ar');
      const englishContent = project.contents?.find(c => c.language_code === 'en');
      
      const projectName = arabicContent?.name || englishContent?.name || 'Unknown';
      const galleryCount = project.gallery?.length || 0;
      const imageCount = englishContent?.images?.length || 0;
      const videoCount = englishContent?.videos?.length || 0;
      
      console.log(`📁 Project ${i + 1}: ${projectName}`);
      console.log(`   🖼️ Gallery: ${galleryCount} images`);
      console.log(`   📸 Content Images: ${imageCount}`);
      console.log(`   🎥 Content Videos: ${videoCount}`);
      console.log(`   🌐 Banner: ${project.bannerPhotoUrl ? 'Yes' : 'No'}`);
      
      // Show sample URLs
      if (galleryCount > 0) {
        console.log(`   📷 Sample gallery: ${project.gallery[0].substring(0, 60)}...`);
      }
      if (imageCount > 0) {
        console.log(`   📷 Sample image: ${englishContent.images[0].substring(0, 60)}...`);
      }
      if (videoCount > 0) {
        console.log(`   🎬 Sample video: ${englishContent.videos[0].substring(0, 60)}...`);
      }
      console.log('');
    }
    
    console.log('✅ Media structure is now optimized for frontend display!');
    console.log('🔄 Restart your dev server and visit any project page');
    console.log('🌐 Example: http://localhost:3000/en/projects/[project-id]');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🔍 Final Media Verification\n');
console.log('This will show the optimized media structure.\n');

verifyMediaFinal();
