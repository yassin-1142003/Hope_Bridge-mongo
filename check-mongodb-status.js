// Check what's currently in MongoDB
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function checkMongoDBStatus() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).limit(3).toArray();
    
    console.log(`📊 Found ${projects.length} projects in MongoDB\n`);
    
    projects.forEach((project, index) => {
      console.log(`🔍 Project ${index + 1}:`);
      console.log(`   ID: ${project._id}`);
      console.log(`   Banner: ${project.bannerPhotoUrl || 'none'}`);
      console.log(`   Contents: ${project.contents?.length || 0}`);
      
      if (project.contents && project.contents.length > 0) {
        project.contents.forEach((content, i) => {
          console.log(`     ${i + 1}. ${content.language_code}: "${content.name}"`);
          console.log(`        Images: ${content.images?.length || 0}`);
          console.log(`        Videos: ${content.videos?.length || 0}`);
        });
      }
      console.log('');
    });

    // Check if real projects exist
    const realProject = await Project.findOne({
      'contents.name': { $regex: /^(توزيع|Hope Bridge|مشروع)/ }
    });
    
    if (realProject) {
      console.log('✅ Found real Hope Bridge project');
    } else {
      console.log('❌ No real Hope Bridge projects found - need to import again');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

console.log('🔍 Checking MongoDB Status\n');
console.log('This will show what projects are currently stored.\n');

checkMongoDBStatus();
