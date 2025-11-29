// Test the projects API endpoint
async function testProjectsAPI() {
  try {
    console.log('🔄 Testing projects API endpoint...');
    
    const response = await fetch('http://localhost:3000/api/projects');
    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ API Response:', result);
    
    if (result.success) {
      console.log(`📊 Found ${result.count} projects`);
      console.log(`🔗 Connection Status: ${result.connectionStatus}`);
      console.log('📁 Media Stats:', result.mediaStats);
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    console.log('💡 Make sure the dev server is running: npm run dev');
  }
}

// Test the API
testProjectsAPI();
