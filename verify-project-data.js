// Verify and sync project data between MongoDB and frontend
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function verifyProjectData() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).limit(3).toArray();
    
    console.log('📊 Checking first 3 projects in MongoDB:\n');
    
    projects.forEach((project, index) => {
      console.log(`🔍 Project ${index + 1} (${project._id}):`);
      console.log(`   Banner URL: ${project.bannerPhotoUrl || 'none'}`);
      console.log(`   Contents length: ${project.contents?.length || 0}`);
      
      if (project.contents && project.contents.length > 0) {
        project.contents.forEach((content, i) => {
          console.log(`     ${i + 1}. Language: "${content.language_code}"`);
          console.log(`        Name: "${content.name}"`);
          console.log(`        Description: "${content.description?.substring(0, 50)}..."`);
        });
      }
      console.log('');
    });

    // Check if improved names exist
    const improvedProject = await Project.findOne({
      'contents.name': { $regex: /^(Clean Water|Education|Healthcare)/ }
    });
    
    if (improvedProject) {
      console.log('✅ Found project with improved names');
      console.log('📝 Sample improved project:');
      improvedProject.contents.forEach((content, i) => {
        console.log(`   ${i + 1}. ${content.language_code}: "${content.name}"`);
      });
    } else {
      console.log('❌ No projects with improved names found');
      console.log('💡 The improvement script may not have run properly');
    }

    // Test API response
    console.log('\n🌐 Testing API response...');
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:3000/api/projects');
    const data = await response.json();
    
    console.log(`📡 API Status: ${response.status}`);
    console.log(`📊 Projects from API: ${data.data?.length || 0}`);
    
    if (data.data && data.data.length > 0) {
      const sampleAPIProject = data.data[0];
      console.log('\n📋 Sample API project:');
      console.log(`   ID: ${sampleAPIProject.id}`);
      console.log(`   Banner: ${sampleAPIProject.bannerPhotoUrl || 'none'}`);
      console.log(`   Contents: ${sampleAPIProject.contents?.length || 0}`);
      
      if (sampleAPIProject.contents && sampleAPIProject.contents.length > 0) {
        sampleAPIProject.contents.forEach((content, i) => {
          console.log(`     ${i + 1}. ${content.language_code}: "${content.name}"`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🔍 Verifying Project Data Sync\n');
console.log('This will check MongoDB data and API response consistency.\n');

verifyProjectData();
