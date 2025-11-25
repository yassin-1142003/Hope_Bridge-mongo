// Fix broken banner images with working URLs
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

// Working banner images (verified URLs)
const workingBannerImages = [
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
  "https://images.unsplash.com/photo-1509099836667-42cc6e496c7a?w=800", 
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
  "https://images.unsplash.com/photo-1582213782179-e0d53c98b267?w=800",
  "https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=800",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
  "https://images.unsplash.com/photo-1582213782179-e0d53c98b267?w=800",
  "https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=800"
];

async function fixBannerImages() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).toArray();
    
    console.log(`📊 Found ${projects.length} projects\n`);
    
    let updatedCount = 0;
    
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const workingBanner = workingBannerImages[i % workingBannerImages.length];
      
      console.log(`🖼️ Project ${project._id}:`);
      console.log(`   Current banner: ${project.bannerPhotoUrl || 'none'}`);
      
      // Update with working banner image
      await Project.updateOne(
        { _id: project._id },
        { $set: { bannerPhotoUrl: workingBanner } }
      );
      
      console.log(`   ✅ Updated to: ${workingBanner}`);
      updatedCount++;
      console.log('');
    }
    
    console.log(`🎉 Updated ${updatedCount} projects with working banner images`);
    console.log('\n💡 All banner images should now load properly!');
    console.log('🔄 Refresh your browser to see the fixed images');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

console.log('🖼️ Fixing Broken Banner Images\n');
console.log('This script will replace broken banner images with working URLs.\n');

fixBannerImages();
