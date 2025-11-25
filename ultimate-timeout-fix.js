// Ultimate fix for Google Drive timeouts - use smallest possible thumbnails
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function ultimateTimeoutFix() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).toArray();
    
    console.log('🚀 Ultimate Timeout Fix - Using Small Thumbnails\n');
    
    let updatedCount = 0;
    
    for (const project of projects) {
      const englishContent = project.contents?.find(c => c.language_code === 'en');
      const projectName = englishContent?.name || 'Unknown';
      
      console.log(`📁 Processing: ${projectName}`);
      
      // Convert to small thumbnail URLs for ultra-fast loading
      const convertToSmallThumbnail = (url) => {
        if (!url || !url.includes('drive.google.com')) return url;
        
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          // Use very small thumbnails (w=200) for lightning fast loading
          return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w200`;
        }
        return url;
      };
      
      // Update banner URL (use medium size for banners)
      const convertToMediumThumbnail = (url) => {
        if (!url || !url.includes('drive.google.com')) return url;
        
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          // Use medium thumbnails (w=400) for banners
          return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`;
        }
        return url;
      };
      
      // Update banner URL
      const newBannerUrl = convertToMediumThumbnail(project.bannerPhotoUrl);
      
      // Update gallery URLs (small thumbnails for gallery)
      const newGallery = (project.gallery || []).map(convertToSmallThumbnail);
      
      // Update content images (small thumbnails)
      const updatedContents = project.contents?.map(content => ({
        ...content,
        images: (content.images || []).map(convertToSmallThumbnail),
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
      
      console.log(`   ✅ Updated: Banner + ${newGallery.length} small thumbnails`);
      updatedCount++;
    }
    
    console.log(`\n🎉 Applied ultimate timeout fix to ${updatedCount} projects`);
    console.log('💡 Images now use ultra-fast small thumbnails');
    console.log('⚡ Gallery images: w=200px (lightning fast)');
    console.log('🖼️ Banner images: w=400px (medium size)');
    console.log('🔄 Restart your dev server to see massive improvement');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🚀 Ultimate Timeout Fix\n');
console.log('This will convert all images to ultra-fast small thumbnails.\n');

ultimateTimeoutFix();
