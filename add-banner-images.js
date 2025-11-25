// Add banner images to all projects
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

// Sample banner images
const bannerImages = [
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
  "https://images.unsplash.com/photo-1509099836667-42cc6e496c7a?w=800", 
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
  "https://images.unsplash.com/photo-1579532584362-d26a8d349ee6?w=800",
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
  "https://images.unsplash.com/photo-1509099836667-42cc6e496c7a?w=800",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
  "https://images.unsplash.com/photo-1579532584362-d26a8d349ee6?w=800"
];

async function addBannerImages() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).toArray();
    
    console.log(`📊 Found ${projects.length} projects\n`);
    
    let updatedCount = 0;
    
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const randomBanner = bannerImages[i % bannerImages.length];
      
      console.log(`🖼️ Project ${project._id}:`);
      console.log(`   Current banner: ${project.bannerPhotoUrl || 'none'}`);
      
      if (!project.bannerPhotoUrl || project.bannerPhotoUrl === 'none') {
        // Update the project with a banner image
        await Project.updateOne(
          { _id: project._id },
          { $set: { bannerPhotoUrl: randomBanner } }
        );
        
        console.log(`   ✅ Added banner: ${randomBanner}`);
        updatedCount++;
      } else {
        console.log('   ✅ Already has banner');
      }
      console.log('');
    }
    
    console.log(`🎉 Updated ${updatedCount} projects with banner images`);
    console.log('\n💡 Now your projects should have beautiful banner images!');
    console.log('🔄 Refresh your browser to see the changes');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

console.log('🖼️ Adding Banner Images to Projects\n');
console.log('This script will add beautiful banner images to projects that don\'t have them.\n');

addBannerImages();
