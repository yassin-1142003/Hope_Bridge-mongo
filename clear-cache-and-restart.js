// Clear all sample projects and ensure only real Hope Bridge projects remain
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function clearCacheAndRestart() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    
    // Get all projects
    const allProjects = await Project.find({}).toArray();
    console.log(`📊 Found ${allProjects.length} total projects\n`);
    
    // Separate real projects from sample projects
    const realProjects = allProjects.filter(project => 
      project.contents && project.contents.some(content => 
        content.name && (
          content.name.includes('توزيع') || 
          content.name.includes('Hope Bridge') || 
          content.name.includes('مشروع') ||
          content.name.includes('Winter') ||
          content.name.includes('Eid') ||
          content.name.includes('Medical')
        )
      )
    );
    
    const sampleProjects = allProjects.filter(project => 
      !realProjects.includes(project)
    );
    
    console.log(`✅ Real Hope Bridge projects: ${realProjects.length}`);
    console.log(`🗑️ Sample projects to remove: ${sampleProjects.length}\n`);
    
    // Remove sample projects
    if (sampleProjects.length > 0) {
      const sampleIds = sampleProjects.map(p => p._id);
      await Project.deleteMany({ _id: { $in: sampleIds } });
      console.log('🗑️ Removed all sample projects');
    }
    
    // Show remaining projects
    const remainingProjects = await Project.find({}).toArray();
    console.log(`\n📋 Remaining projects (${remainingProjects.length}):`);
    
    remainingProjects.forEach((project, index) => {
      const arabicName = project.contents?.find(c => c.language_code === 'ar')?.name || 'N/A';
      const englishName = project.contents?.find(c => c.language_code === 'en')?.name || 'N/A';
      const imageCount = project.contents?.[0]?.images?.length || 0;
      const videoCount = project.contents?.[0]?.videos?.length || 0;
      
      console.log(`   ${index + 1}. ${arabicName} / ${englishName}`);
      console.log(`      📸 ${imageCount} images, 🎥 ${videoCount} videos`);
    });
    
    console.log('\n🎉 MongoDB is now clean with only real Hope Bridge projects!');
    console.log('💡 Restart your dev server to see the real projects on the website');
    console.log('🔄 Run: npm run dev');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

console.log('🧹 Clearing Sample Projects\n');
console.log('This will remove all sample projects and keep only real Hope Bridge data.\n');

clearCacheAndRestart();
