// Check the actual database structure to debug the ID issue
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function checkDatabaseStructure() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).limit(2).toArray();
    
    console.log('🔍 Checking Database Structure\n');
    
    for (const project of projects) {
      const englishContent = project.contents?.find(c => c.language_code === 'en');
      const projectName = englishContent?.name || 'Unknown';
      
      console.log(`📁 Project: ${projectName}`);
      console.log(`   🆔 _id: ${project._id}`);
      console.log(`   🆔 _id type: ${typeof project._id}`);
      console.log(`   🆔 _id toString(): ${project._id?.toString()}`);
      console.log(`   🖼️ Banner: ${project.bannerPhotoUrl?.substring(0, 50)}...`);
      console.log(`   🖼️ Gallery Count: ${project.gallery?.length || 0}`);
      console.log(`   📸 Contents Count: ${project.contents?.length || 0}`);
      
      // Test the toProject conversion
      const convertedProject = {
        id: project._id?.toString(),
        bannerPhotoUrl: project.bannerPhotoUrl,
        bannerPhotoId: project.bannerPhotoId,
        gallery: project.gallery ?? [],
        created_at: project.created_at,
        contents: project.contents ?? []
      };
      
      console.log(`   ✅ Converted ID: ${convertedProject.id}`);
      console.log('');
    }
    
    console.log('🔧 Testing API Response Format...');
    
    // Test what the API should return
    const apiResponse = projects.map(project => ({
      id: project._id?.toString(),
      bannerPhotoUrl: project.bannerPhotoUrl,
      bannerPhotoId: project.bannerPhotoId,
      gallery: project.gallery ?? [],
      created_at: project.created_at,
      contents: project.contents ?? []
    }));
    
    console.log(`✅ API would return ${apiResponse.length} projects with proper IDs`);
    console.log(`   • First project ID: ${apiResponse[0]?.id}`);
    console.log(`   • ID type: ${typeof apiResponse[0]?.id}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🔍 Checking Database Structure\n');
console.log('This will debug the ID issue in the API response.\n');

checkDatabaseStructure();
