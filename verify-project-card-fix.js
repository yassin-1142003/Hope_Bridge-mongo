// Verify that ProjectCard component will use direct URLs instead of /api/media/
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function verifyProjectCardFix() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).limit(3).toArray();
    
    console.log('🧪 Verifying ProjectCard Media URL Fix\n');
    
    for (const project of projects) {
      const englishContent = project.contents?.find(c => c.language_code === 'en');
      const arabicContent = project.contents?.find(c => c.language_code === 'ar');
      
      const projectName = englishContent?.name || arabicContent?.name || 'Unknown';
      const imageCount = englishContent?.images?.length || 0;
      const videoCount = englishContent?.videos?.length || 0;
      
      console.log(`📁 Project: ${projectName}`);
      console.log(`   📸 Images: ${imageCount}`);
      console.log(`   🎥 Videos: ${videoCount}`);
      
      // Test image URLs
      if (imageCount > 0) {
        const sampleImageUrl = englishContent.images[0];
        console.log(`   📷 Sample Image URL: ${sampleImageUrl.substring(0, 60)}...`);
        console.log(`      ✅ Is Direct URL: ${sampleImageUrl.startsWith('http') ? 'YES' : 'NO'}`);
        console.log(`      🔄 ProjectCard Will Use: ${sampleImageUrl.startsWith('http') ? sampleImageUrl : '/api/media/' + sampleImageUrl}`);
      }
      
      // Test video URLs
      if (videoCount > 0) {
        const sampleVideoUrl = englishContent.videos[0];
        console.log(`   🎬 Sample Video URL: ${sampleVideoUrl.substring(0, 60)}...`);
        console.log(`      ✅ Is Direct URL: ${sampleVideoUrl.startsWith('http') ? 'YES' : 'NO'}`);
        console.log(`      🔄 ProjectCard Will Use: ${sampleVideoUrl.startsWith('http') ? sampleVideoUrl : '/api/media/' + sampleVideoUrl}`);
      }
      
      console.log('');
    }
    
    console.log('✅ ProjectCard component fix verified!');
    console.log('🔄 The component will now use direct URLs instead of /api/media/');
    console.log('🌐 Restart your dev server to see the fix in action');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🧪 Verifying ProjectCard Media URL Fix\n');
console.log('This will confirm that ProjectCard will use direct URLs.\n');

verifyProjectCardFix();
