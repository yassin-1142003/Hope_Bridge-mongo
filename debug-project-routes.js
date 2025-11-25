// Debug project routes and slugs
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function debugProjectRoutes() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).limit(3).toArray();
    
    console.log('🔍 Debugging Project Routes and Slugs\n');
    
    for (const project of projects) {
      const englishContent = project.contents?.find(c => c.language_code === 'en');
      const projectName = englishContent?.name || 'Unknown';
      
      console.log(`📁 Project: ${projectName}`);
      console.log(`   🆔 MongoDB ID: ${project._id}`);
      console.log(`   🔗 Expected URL: /en/projects/${project._id}`);
      
      // Test slug generation
      const slugify = (text) => {
        return text
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
      };
      
      const titleSlug = slugify(projectName);
      const fullSlug = `${titleSlug}-${project._id}`;
      
      console.log(`   📝 Title Slug: ${titleSlug}`);
      console.log(`   🔗 Full Slug: ${fullSlug}`);
      console.log(`   🔗 Detail URL: /en/projects/${fullSlug}`);
      
      // Check if the project API works
      console.log(`   📡 Testing API: /api/projects/${project._id}`);
    }
    
    console.log('\n🎯 Route Issues to Fix:');
    console.log('   1. Project detail pages need proper slug handling');
    console.log('   2. API routes need to work with both ID and slug');
    console.log('   3. Frontend needs correct URL generation');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🔍 Debugging Project Routes and Slugs\n');
console.log('This will identify why project detail pages are failing.\n');

debugProjectRoutes();
