// Test the projects API to see if it works without MongoDB
async function testProjectsAPI() {
  try {
    console.log('🔄 Testing projects API...');
    
    const response = await fetch('http://localhost:3000/api/projects');
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ API Response Success!');
      console.log(`📊 Connection Status: ${result.connectionStatus}`);
      console.log(`📊 Found ${result.count} projects`);
      
      // Display project structure with media arrays
      result.data.forEach((project, index) => {
        console.log(`\n🎯 Project ${index + 1}: ${project.title}`);
        console.log(`   📸 Images: ${project.images?.length || 0}`);
        console.log(`   🎥 Videos: ${project.videos?.length || 0}`);
        console.log(`   🖼️ Gallery: ${project.gallery?.length || 0}`);
        console.log(`   📼 All Media: ${project.allMedia?.length || 0}`);
        console.log(`   🌄 Banner: ${project.bannerPhotoUrl || 'None'}`);
        
        // Show sample media items
        if (project.gallery && project.gallery.length > 0) {
          console.log(`   Sample Gallery: ${project.gallery[0].url} (${project.gallery[0].alt})`);
        }
      });
      
      console.log('\n📁 Media Stats:', result.mediaStats);
    } else {
      console.error('❌ API Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure the dev server is running: npm run dev');
  }
}

// Run the test
testProjectsAPI();
