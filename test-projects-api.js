// Test script to demonstrate the enhanced projects API with media
async function testProjectsAPI() {
  try {
    console.log('🔄 Testing enhanced projects API with media...');
    
    const response = await fetch('http://localhost:3000/api/projects');
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ API Response Success!');
      console.log(`📊 Found ${result.count} projects`);
      console.log(`📁 Media Stats:`, result.mediaStats);
      
      // Display project structure with media arrays
      result.data.forEach((project, index) => {
        console.log(`\n🎯 Project ${index + 1}: ${project.title}`);
        console.log(`   📸 Images: ${project.images?.length || 0}`);
        console.log(`   🎥 Videos: ${project.videos?.length || 0}`);
        console.log(`   🖼️ Banners: ${project.banners?.length || 0}`);
        console.log(`   🌄 Gallery: ${project.gallery?.length || 0}`);
        console.log(`   📼 All Media: ${project.allMedia?.length || 0}`);
        
        // Show sample media items
        if (project.images && project.images.length > 0) {
          console.log(`   Sample Image: ${project.images[0].title} (${project.images[0].url})`);
        }
        if (project.videos && project.videos.length > 0) {
          console.log(`   Sample Video: ${project.videos[0].title} (${project.videos[0].url})`);
        }
      });
    } else {
      console.error('❌ API Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testProjectsAPI();
