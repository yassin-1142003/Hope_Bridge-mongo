// Force convert all URLs to thumbnail format
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function forceThumbnailConversion() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).toArray();
    
    console.log('🔨 Force Thumbnail Conversion\n');
    
    let updatedCount = 0;
    
    for (const project of projects) {
      const englishContent = project.contents?.find(c => c.language_code === 'en');
      const projectName = englishContent?.name || 'Unknown';
      
      console.log(`📁 Processing: ${projectName}`);
      
      // Force convert any Google Drive URL to thumbnail
      const forceConvertToThumbnail = (url, size = 'w200') => {
        if (!url || !url.includes('drive.google.com')) return url;
        
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          return `https://drive.google.com/thumbnail?id=${match[1]}&sz=${size}`;
        }
        return url;
      };
      
      // Update banner URL (medium size)
      const newBannerUrl = forceConvertToThumbnail(project.bannerPhotoUrl, 'w400');
      
      // Update gallery URLs (small size)
      const newGallery = (project.gallery || []).map(url => forceConvertToThumbnail(url, 'w200'));
      
      // Update content images (small size)
      const updatedContents = project.contents?.map(content => ({
        ...content,
        images: (content.images || []).map(url => forceConvertToThumbnail(url, 'w200')),
        videos: content.videos || [] // Keep videos as-is
      }));
      
      // Check if anything actually changed
      const bannerChanged = newBannerUrl !== project.bannerPhotoUrl;
      const galleryChanged = JSON.stringify(newGallery) !== JSON.stringify(project.gallery);
      const contentChanged = JSON.stringify(updatedContents) !== JSON.stringify(project.contents);
      
      if (bannerChanged || galleryChanged || contentChanged) {
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
        
        console.log(`   ✅ Force updated: Banner=${bannerChanged}, Gallery=${galleryChanged}, Content=${contentChanged}`);
        updatedCount++;
      } else {
        console.log(`   ℹ️ No changes needed`);
      }
    }
    
    console.log(`\n🎉 Force converted ${updatedCount} projects to thumbnail URLs`);
    console.log('💡 All images now use thumbnail format for ultra-fast loading');
    console.log('🔄 Restart your dev server to see the dramatic improvement');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🔨 Force Thumbnail Conversion\n');
console.log('This will force convert all images to thumbnail URLs.\n');

forceThumbnailConversion();
