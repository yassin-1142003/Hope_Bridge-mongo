// Fix media display by updating project data structure for frontend
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function fixMediaDisplay() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).toArray();
    
    console.log(`📊 Fixing media display for ${projects.length} projects\n`);
    
    let updatedCount = 0;
    
    for (const project of projects) {
      console.log(`🔄 Processing: ${project.contents?.[0]?.name || 'Unknown'}`);
      
      // Get the localized content
      const arabicContent = project.contents?.find(c => c.language_code === 'ar');
      const englishContent = project.contents?.find(c => c.language_code === 'en');
      
      if (!arabicContent || !englishContent) {
        console.log('   ⚠️ Missing content, skipping...');
        continue;
      }
      
      // Ensure both languages have the same media arrays
      const allImages = project.gallery || [];
      const allVideos = [];
      
      // Add images from content if they exist
      if (englishContent.images && Array.isArray(englishContent.images)) {
        allImages.push(...englishContent.images);
      }
      if (arabicContent.images && Array.isArray(arabicContent.images)) {
        allImages.push(...arabicContent.images);
      }
      
      // Add videos from content if they exist
      if (englishContent.videos && Array.isArray(englishContent.videos)) {
        allVideos.push(...englishContent.videos);
      }
      if (arabicContent.videos && Array.isArray(arabicContent.videos)) {
        allVideos.push(...arabicContent.videos);
      }
      
      // Remove duplicates
      const uniqueImages = [...new Set(allImages)];
      const uniqueVideos = [...new Set(allVideos)];
      
      // Update project structure
      const updatedProject = {
        ...project,
        gallery: uniqueImages, // All images in gallery
        contents: project.contents.map(content => ({
          ...content,
          images: uniqueImages, // Same images for all languages
          videos: uniqueVideos, // Same videos for all languages
          documents: [] // Empty documents array
        }))
      };
      
      // Save the updated project
      await Project.replaceOne({ _id: project._id }, updatedProject);
      
      console.log(`   ✅ Updated: ${uniqueImages.length} images, ${uniqueVideos.length} videos`);
      updatedCount++;
    }
    
    console.log(`\n🎉 Fixed media display for ${updatedCount} projects`);
    console.log('\n💡 Media galleries should now display properly!');
    console.log('🔄 Restart your dev server to see the changes');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

console.log('🖼️ Fixing Media Display\n');
console.log('This will update project structure to show media galleries properly.\n');

fixMediaDisplay();
