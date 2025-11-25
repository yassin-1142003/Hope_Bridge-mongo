// Fix project slugs to use proper MongoDB ObjectId format
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function fixProjectSlugs() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).toArray();
    
    console.log('🔧 Fixing Project Slugs\n');
    
    for (const project of projects) {
      const englishContent = project.contents?.find(c => c.language_code === 'en');
      const projectName = englishContent?.name || 'Unknown';
      
      console.log(`📁 Project: ${projectName}`);
      console.log(`   🆔 Current ID: ${project._id}`);
      
      // Generate a proper slug using the ObjectId
      const slug = `${projectName.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)}-${project._id}`;
      
      console.log(`   🔗 New Slug: ${slug}`);
      console.log('');
    }
    
    console.log('✅ Project slugs analyzed');
    console.log('💡 The issue is that the frontend is trying to use slugs instead of ObjectIds');
    console.log('🔧 Need to update the project detail page to handle proper IDs');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🔧 Fixing Project Slugs\n');
console.log('This will analyze the project ID format issue.\n');

fixProjectSlugs();
