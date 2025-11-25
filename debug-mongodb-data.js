// Debug script to check MongoDB data structure
const mongoose = require('mongoose');

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

// Simple project schema for debugging
const projectSchema = new mongoose.Schema({}, { strict: false });
const Project = mongoose.model('Project', projectSchema);

async function debugMongoData() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    // Get all projects
    const projects = await Project.find({}).limit(3);
    console.log(`📊 Found ${projects.length} projects\n`);

    projects.forEach((project, index) => {
      console.log(`🔍 Project ${index + 1}:`);
      console.log(`   ID: ${project._id}`);
      console.log(`   Banner URL: ${project.bannerPhotoUrl || 'none'}`);
      console.log(`   Created: ${project.created_at}`);
      
      if (project.contents && Array.isArray(project.contents)) {
        console.log(`   Contents (${project.contents.length}):`);
        project.contents.forEach((content, i) => {
          console.log(`     ${i + 1}. Language: "${content.language_code}"`);
          console.log(`        Name: "${content.name}"`);
          console.log(`        Description: "${content.description}"`);
          console.log(`        Has images: ${content.images ? content.images.length : 0}`);
          console.log(`        Has videos: ${content.videos ? content.videos.length : 0}`);
          console.log(`        Has documents: ${content.documents ? content.documents.length : 0}`);
        });
      } else {
        console.log(`   ❌ No contents array or invalid structure`);
        console.log(`   Contents type: ${typeof project.contents}`);
        console.log(`   Contents value:`, project.contents);
      }
      console.log('');
    });

    // Check language codes
    console.log('🌐 Language Code Analysis:');
    const allProjects = await Project.find({});
    const languageCodes = new Set();
    
    allProjects.forEach(project => {
      if (project.contents && Array.isArray(project.contents)) {
        project.contents.forEach(content => {
          languageCodes.add(content.language_code);
        });
      }
    });
    
    console.log(`   Found language codes: ${Array.from(languageCodes).join(', ')}`);
    console.log(`   Expected: "en", "ar"`);
    
    // Check for English content specifically
    const englishProjects = allProjects.filter(project => 
      project.contents && 
      project.contents.some(content => content.language_code === 'en')
    );
    
    console.log(`   Projects with English content: ${englishProjects.length}/${allProjects.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

console.log('🔍 MongoDB Data Structure Debug\n');
debugMongoData();
