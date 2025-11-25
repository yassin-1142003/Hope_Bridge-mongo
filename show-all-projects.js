// Quick fix to show all projects regardless of language codes
const mongoose = require('mongoose');

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function fixProjectLanguages() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).toArray();
    
    console.log(`📊 Found ${projects.length} projects\n`);
    
    let updatedCount = 0;
    
    for (const project of projects) {
      console.log(`🔍 Project: ${project._id}`);
      
      if (!project.contents || !Array.isArray(project.contents)) {
        console.log('   ❌ No contents array - skipping');
        continue;
      }
      
      console.log(`   📝 Contents: ${project.contents.length}`);
      
      // Check if contents have proper language codes
      const needsUpdate = project.contents.some(content => 
        !content.language_code || 
        (content.language_code !== 'en' && content.language_code !== 'ar')
      );
      
      if (needsUpdate) {
        console.log('   🔧 Fixing language codes...');
        
        // Update contents to have proper language codes
        const updatedContents = project.contents.map((content, index) => {
          if (!content.language_code) {
            // If no language code, assume first is English, second is Arabic
            const langCode = index === 0 ? 'en' : 'ar';
            return { ...content, language_code: langCode };
          } else if (content.language_code !== 'en' && content.language_code !== 'ar') {
            // If language code is not 'en' or 'ar', normalize it
            const normalizedLang = content.language_code.toLowerCase().includes('en') ? 'en' : 'ar';
            return { ...content, language_code: normalizedLang };
          }
          return content;
        });
        
        // Update the project
        await Project.updateOne(
          { _id: project._id },
          { $set: { contents: updatedContents } }
        );
        
        console.log('   ✅ Updated language codes');
        updatedCount++;
      } else {
        console.log('   ✅ Language codes are correct');
      }
      
      // Show current language codes
      project.contents.forEach((content, i) => {
        console.log(`     ${i + 1}. "${content.language_code}" - "${content.name}"`);
      });
      console.log('');
    }
    
    console.log(`🎉 Updated ${updatedCount} projects with proper language codes`);
    console.log('\n💡 Now your projects should appear on the website!');
    console.log('🔄 Restart your dev server to see the changes');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

console.log('🔧 Fixing Project Language Codes\n');
console.log('This script will fix projects that have incorrect or missing language codes.\n');

fixProjectLanguages();
