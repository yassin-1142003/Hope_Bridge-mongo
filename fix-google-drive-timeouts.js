// Fix Google Drive image timeouts by converting to thumbnail URLs
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function fixGoogleDriveTimeouts() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).toArray();
    
    console.log('🖼️ Fixing Google Drive Image Timeouts\n');
    
    let updatedCount = 0;
    
    for (const project of projects) {
      const englishContent = project.contents?.find(c => c.language_code === 'en');
      const projectName = englishContent?.name || 'Unknown';
      
      console.log(`📁 Processing: ${projectName}`);
      
      // Convert all image URLs to thumbnail URLs for faster loading
      const convertToThumbnail = (url) => {
        if (!url || !url.includes('drive.google.com')) return url;
        
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          // Use thumbnail URL which is much faster
          return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
        }
        return url;
      };
      
      // Update banner URL
      const newBannerUrl = convertToThumbnail(project.bannerPhotoUrl);
      
      // Update gallery URLs
      const newGallery = (project.gallery || []).map(convertToThumbnail);
      
      // Update content images
      const updatedContents = project.contents?.map(content => ({
        ...content,
        images: (content.images || []).map(convertToThumbnail),
        videos: content.videos || [] // Keep videos as-is
      }));
      
      // Update project if anything changed
      if (newBannerUrl !== project.bannerPhotoUrl || 
          JSON.stringify(newGallery) !== JSON.stringify(project.gallery) ||
          JSON.stringify(updatedContents) !== JSON.stringify(project.contents)) {
        
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
      } else {
        console.log(`   ℹ️ No changes needed`);
      }
    }
    
    console.log(`\n🎉 Fixed image timeouts for ${updatedCount} projects`);
    console.log('💡 Images now use faster thumbnail URLs');
    console.log('🔄 Restart your dev server to see faster loading');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🖼️ Fixing Google Drive Image Timeouts\n');
console.log('This will convert slow-loading images to fast thumbnails.\n');

fixGoogleDriveTimeouts();
