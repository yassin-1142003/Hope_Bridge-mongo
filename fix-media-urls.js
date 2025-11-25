// Convert Google Drive links to direct image URLs for proper display
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

// Convert Google Drive URL to direct download URL
function convertGoogleDriveURL(url) {
  if (!url || !url.includes('drive.google.com')) return url;
  
  // Extract file ID from Google Drive URL
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  return url;
}

async function fixMediaURLs() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).toArray();
    
    console.log(`📊 Processing ${projects.length} projects\n`);
    
    let updatedCount = 0;
    let convertedImages = 0;
    let convertedVideos = 0;
    
    for (const project of projects) {
      let hasChanges = false;
      
      // Process contents
      const updatedContents = project.contents.map(content => {
        let updatedContent = { ...content };
        
        // Convert image URLs
        if (content.images && content.images.length > 0) {
          const convertedImagesList = content.images.map(img => {
            const converted = convertGoogleDriveURL(img);
            if (converted !== img) {
              convertedImages++;
              hasChanges = true;
            }
            return converted;
          });
          updatedContent.images = convertedImagesList;
        }
        
        // Convert video URLs
        if (content.videos && content.videos.length > 0) {
          const convertedVideosList = content.videos.map(video => {
            const converted = convertGoogleDriveURL(video);
            if (converted !== video) {
              convertedVideos++;
              hasChanges = true;
            }
            return converted;
          });
          updatedContent.videos = convertedVideosList;
        }
        
        return updatedContent;
      });
      
      // Convert banner URL
      const convertedBanner = convertGoogleDriveURL(project.bannerPhotoUrl);
      if (convertedBanner !== project.bannerPhotoUrl) {
        hasChanges = true;
      }
      
      // Update project if changes were made
      if (hasChanges) {
        await Project.updateOne(
          { _id: project._id },
          { 
            $set: { 
              contents: updatedContents,
              bannerPhotoUrl: convertedBanner
            }
          }
        );
        
        const projectName = project.contents?.find(c => c.language_code === 'en')?.name || 'Unknown';
        console.log(`✅ Updated: ${projectName}`);
        updatedCount++;
      }
    }
    
    console.log(`\n🎉 Updated ${updatedCount} projects`);
    console.log(`📸 Converted ${convertedImages} image URLs`);
    console.log(`🎥 Converted ${convertedVideos} video URLs`);
    console.log('\n💡 All media URLs should now display properly!');
    console.log('🔄 Restart your dev server to see the fixed images and videos');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

console.log('🖼️ Fixing Media URLs\n');
console.log('This will convert Google Drive links to direct URLs for proper display.\n');

fixMediaURLs();
