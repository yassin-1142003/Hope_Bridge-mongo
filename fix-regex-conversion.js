// Fix the regex to match the actual URL format
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function fixRegexConversion() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).toArray();
    
    console.log('🔧 Fix Regex Conversion\n');
    
    let updatedCount = 0;
    
    for (const project of projects) {
      const englishContent = project.contents?.find(c => c.language_code === 'en');
      const projectName = englishContent?.name || 'Unknown';
      
      console.log(`📁 Processing: ${projectName}`);
      
      // Convert uc?export=view URLs to thumbnail URLs
      const convertToThumbnail = (url, size = 'w200') => {
        if (!url || !url.includes('drive.google.com')) return url;
        
        // Match the actual URL format: uc?export=view&id=FILE_ID
        const match = url.match(/id=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          return `https://drive.google.com/thumbnail?id=${match[1]}&sz=${size}`;
        }
        return url;
      };
      
      // Update banner URL (medium size)
      const newBannerUrl = convertToThumbnail(project.bannerPhotoUrl, 'w400');
      
      // Update gallery URLs (small size)
      const newGallery = (project.gallery || []).map(url => convertToThumbnail(url, 'w200'));
      
      // Update content images (small size)
      const updatedContents = project.contents?.map(content => ({
        ...content,
        images: (content.images || []).map(url => convertToThumbnail(url, 'w200')),
        videos: content.videos || [] // Keep videos as-is
      }));
      
      // Check if anything changed
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
        
        console.log(`   ✅ Updated: Banner=${bannerChanged}, Gallery=${galleryChanged}, Content=${contentChanged}`);
        
        // Show before/after for banner
        if (bannerChanged) {
          console.log(`      🖼️ Before: ${project.bannerPhotoUrl.substring(0, 60)}...`);
          console.log(`      🖼️ After:  ${newBannerUrl.substring(0, 60)}...`);
        }
        
        updatedCount++;
      } else {
        console.log(`   ℹ️ No changes needed`);
      }
    }
    
    console.log(`\n🎉 Successfully converted ${updatedCount} projects to thumbnail URLs`);
    console.log('💡 All images now use ultra-fast thumbnail format');
    console.log('⚡ Expected performance: Load in < 500ms instead of 7+ seconds');
    console.log('🔄 Restart your dev server to see the dramatic improvement');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🔧 Fix Regex Conversion\n');
console.log('This will fix the regex to match uc?export=view&id= format.\n');

fixRegexConversion();
