// Import real Hope Bridge projects from charity-backend CSV data
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

// Parse CSV data
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  
  return lines.slice(1).filter(line => line.trim()).map(line => {
    const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] ? values[index].replace(/"/g, '') : '';
    });
    return obj;
  });
}

async function importRealProjects() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    // Read CSV files
    const csvPath = 'c:/Users/yassi/Downloads/hope-bridge-main/hope-bridge-main/charity-backend/dist/db/projects';
    
    const posts = parseCSV(path.join(csvPath, 'post.csv'));
    const contents = parseCSV(path.join(csvPath, 'post_content.csv'));
    const media = parseCSV(path.join(csvPath, 'post_media.csv'));
    
    console.log(`📊 Found ${posts.length} posts, ${contents.length} contents, ${media.length} media files\n`);
    
    // Filter only active projects
    const activeProjects = posts.filter(post => post.category === 'project' && post.Active === 'true');
    console.log(`🎯 Active projects: ${activeProjects.length}`);
    console.log('📋 All projects:', posts.map(p => ({ id: p.id, category: p.category, active: p.Active })));
    
    if (activeProjects.length === 0) {
      console.log('⚠️ No active projects found, importing all projects...');
      // If no active projects, import all project posts
      activeProjects.push(...posts.filter(post => post.category === 'project'));
    }
    
    console.log(`🎯 Total projects to import: ${activeProjects.length}\n`);
    
    const Project = mongoose.connection.db.collection('project');
    
    // Clear existing projects
    await Project.deleteMany({});
    console.log('🗑️ Cleared existing projects\n');
    
    let importedCount = 0;
    
    for (const post of activeProjects) {
      // Get content for this post
      const postContents = contents.filter(content => content.post_id === post.id);
      
      // Get media for this post
      const postMedia = media.filter(m => m.post_id === post.id);
      
      // Find banner image (first image)
      const bannerImage = postMedia.find(m => m.type === 'img')?.url || 
                         "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800";
      
      // Create project contents
      const projectContents = postContents.map(content => ({
        language_code: content.language_code,
        name: content.name,
        description: content.description,
        content: content.content,
        images: postMedia.filter(m => m.type === 'img').map(m => m.url),
        videos: postMedia.filter(m => m.type === 'video').map(m => m.url),
        documents: []
      }));
      
      // Create project document
      const projectData = {
        _id: new mongoose.Types.ObjectId(),
        bannerPhotoUrl: bannerImage,
        gallery: postMedia.filter(m => m.type === 'img').slice(1).map(m => m.url), // Exclude banner from gallery
        created_at: new Date(post.created_at),
        contents: projectContents
      };
      
      // Insert project
      await Project.insertOne(projectData);
      
      console.log(`✅ Imported: ${postContents[0]?.name || 'Unknown Project'}`);
      console.log(`   📝 Contents: ${projectContents.length} languages`);
      console.log(`   🖼️ Media: ${postMedia.length} files`);
      console.log(`   📅 Created: ${post.created_at}`);
      console.log('');
      
      importedCount++;
    }
    
    console.log(`🎉 Successfully imported ${importedCount} real Hope Bridge projects!`);
    console.log('\n💡 Your projects now contain actual Hope Bridge data:');
    console.log('   - Real project names in Arabic and English');
    console.log('   - Actual project descriptions and content');
    console.log('   - Real media files (images and videos)');
    console.log('   - Proper creation dates');
    console.log('\n🔄 Refresh your browser to see the real projects!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

console.log('📥 Importing Real Hope Bridge Projects\n');
console.log('This will replace the sample projects with actual Hope Bridge data from your charity-backend.\n');

importRealProjects();
