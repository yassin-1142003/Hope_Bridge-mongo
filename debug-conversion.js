// Debug the conversion process
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function debugConversion() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).limit(1).toArray();
    
    console.log('🐛 Debugging Conversion Process\n');
    
    const project = projects[0];
    const englishContent = project.contents?.find(c => c.language_code === 'en');
    const projectName = englishContent?.name || 'Unknown';
    
    console.log(`📁 Testing with: ${projectName}`);
    
    // Test the conversion logic
    const testUrl = project.bannerPhotoUrl;
    console.log(`   🔍 Original URL: ${testUrl}`);
    console.log(`   🔍 Contains drive.google.com: ${testUrl.includes('drive.google.com')}`);
    
    // Test the regex
    const match = testUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    console.log(`   🔍 Regex match result:`, match);
    
    if (match && match[1]) {
      const thumbnailUrl = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`;
      console.log(`   ✅ Thumbnail URL: ${thumbnailUrl}`);
      console.log(`   🔍 URLs are different: ${thumbnailUrl !== testUrl}`);
      
      // Force update this one project
      await Project.updateOne(
        { _id: project._id },
        { $set: { bannerPhotoUrl: thumbnailUrl } }
      );
      
      console.log(`   🎯 Forced update for banner URL`);
      
      // Verify the update
      const updatedProject = await Project.findOne({ _id: project._id });
      console.log(`   ✅ Updated URL: ${updatedProject.bannerPhotoUrl}`);
      
    } else {
      console.log(`   ❌ Regex failed to match URL`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🐛 Debugging Conversion Process\n');
console.log('This will test the conversion logic step by step.\n');

debugConversion();
