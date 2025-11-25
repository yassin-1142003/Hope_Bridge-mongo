// Fix projects with empty contents arrays
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function fixEmptyProjects() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).toArray();
    
    console.log(`📊 Found ${projects.length} projects\n`);
    
    let updatedCount = 0;
    
    for (const project of projects) {
      console.log(`🔍 Project ${project._id}:`);
      console.log(`   Banner URL: ${project.bannerPhotoUrl || 'none'}`);
      console.log(`   Contents length: ${project.contents?.length || 0}`);
      
      if (!project.contents || project.contents.length === 0) {
        console.log('   🔧 Adding default content...');
        
        // Add default English and Arabic content
        const defaultContents = [
          {
            language_code: "en",
            name: `Project ${project._id.toString().slice(-6)}`,
            description: "A project that needs content",
            content: "This project was automatically populated with default content. Please update with proper information.",
            images: [],
            videos: [],
            documents: []
          },
          {
            language_code: "ar",
            name: `مشروع ${project._id.toString().slice(-6)}`,
            description: "مشروع يحتاج إلى محتوى",
            content: "تم ملء هذا المشروع تلقائيًا بمحتوى افتراضي. يرجى التحديث بالمعلومات الصحيحة.",
            images: [],
            videos: [],
            documents: []
          }
        ];
        
        // Update the project
        await Project.updateOne(
          { _id: project._id },
          { 
            $set: { 
              contents: defaultContents,
              created_at: project.created_at || new Date()
            }
          }
        );
        
        console.log('   ✅ Added default content');
        updatedCount++;
      } else {
        console.log('   ✅ Already has content');
      }
      console.log('');
    }
    
    console.log(`🎉 Updated ${updatedCount} projects with default content`);
    console.log('\n💡 Now your projects should appear on the website!');
    console.log('🔄 Refresh your browser to see the changes');
    
    // Show sample of what was created
    if (updatedCount > 0) {
      const sampleProject = await Project.findOne({ contents: { $exists: true, $ne: [] } });
      if (sampleProject) {
        console.log('\n📋 Sample project structure:');
        console.log(JSON.stringify(sampleProject.contents, null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

console.log('🔧 Fixing Projects with Empty Contents\n');
console.log('This script will add default English and Arabic content to projects that have empty contents arrays.\n');

fixEmptyProjects();
