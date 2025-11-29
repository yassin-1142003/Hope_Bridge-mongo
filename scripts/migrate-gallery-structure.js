const { MongoClient } = require('mongodb');

async function migrateGalleryStructure() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hope-bridge';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db();
    const projectsCollection = db.collection('projects');
    
    // Get all projects that have the old gallery structure
    const projects = await projectsCollection.find({}).toArray();
    console.log(`📊 Found ${projects.length} projects to migrate`);
    
    let migratedCount = 0;
    
    for (const project of projects) {
      // Check if project has old gallery structure and doesn't have new structure
      if (project.gallery && !project.imageGallery && !project.videoGallery) {
        // Separate images and videos based on file extensions or URL patterns
        const imageGallery = [];
        const videoGallery = [];
        
        for (const url of project.gallery) {
          // Check if it's a video based on common video file extensions or patterns
          const isVideo = /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m4v)(\?.*)?$/i.test(url) ||
                          url.includes('video') ||
                          url.includes('/d/') && url.includes('view'); // Google Drive video pattern
          
          if (isVideo) {
            videoGallery.push(url);
          } else {
            // Assume it's an image if not clearly a video
            imageGallery.push(url);
          }
        }
        
        // Update the project with new separated galleries
        await projectsCollection.updateOne(
          { _id: project._id },
          {
            $set: {
              imageGallery: imageGallery,
              videoGallery: videoGallery
            },
            $unset: {
              gallery: 1 // Remove the old gallery field
            }
          }
        );
        
        console.log(`✅ Migrated project: ${project._id}`);
        console.log(`   📸 Images: ${imageGallery.length}`);
        console.log(`   🎥 Videos: ${videoGallery.length}`);
        
        migratedCount++;
      }
    }
    
    console.log(`\n🎉 Migration complete!`);
    console.log(`📊 Total projects migrated: ${migratedCount}`);
    
    if (migratedCount > 0) {
      console.log('\n📋 Migration Summary:');
      console.log('- Separated gallery into imageGallery and videoGallery');
      console.log('- Removed old gallery field');
      console.log('- Preserved all existing media URLs');
    } else {
      console.log('ℹ️ No projects needed migration (already using new structure)');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  migrateGalleryStructure();
}

module.exports = { migrateGalleryStructure };
