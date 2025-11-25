// Aggressive fix for Google Drive timeouts - use direct download URLs
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function aggressiveTimeoutFix() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).toArray();
    
    console.log('🚀 Aggressive Timeout Fix\n');
    
    let updatedCount = 0;
    
    for (const project of projects) {
      const englishContent = project.contents?.find(c => c.language_code === 'en');
      const projectName = englishContent?.name || 'Unknown';
      
      console.log(`📁 Processing: ${projectName}`);
      
      // Convert to direct download URLs which are more reliable
      const convertToDirectUrl = (url) => {
        if (!url || !url.includes('drive.google.com')) return url;
        
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          // Use direct download URL - most reliable
          return `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
        return url;
      };
      
      // Update banner URL
      const newBannerUrl = convertToDirectUrl(project.bannerPhotoUrl);
      
      // Update gallery URLs
      const newGallery = (project.gallery || []).map(convertToDirectUrl);
      
      // Update content images
      const updatedContents = project.contents?.map(content => ({
        ...content,
        images: (content.images || []).map(convertToDirectUrl),
        videos: content.videos || [] // Keep videos as-is
      }));
      
      // Update project
      await Project.updateOne(
        { _id: project._id },
        { 
          $set: {
            bannerPhotoUrl: newBannerUrl,
            gallery: newGallery,
            contents: updatedContents
          }
        }
      );
      
      console.log(`   ✅ Updated: Banner + ${newGallery.length} gallery images`);
      updatedCount++;
    }
    
    console.log(`\n🎉 Applied aggressive timeout fix to ${updatedCount} projects`);
    console.log('💡 Images now use direct download URLs');
    console.log('🔄 Restart your dev server to see the improvement');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🚀 Aggressive Timeout Fix\n');
console.log('This will convert all images to direct download URLs.\n');

aggressiveTimeoutFix();
