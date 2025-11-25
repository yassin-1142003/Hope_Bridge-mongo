// Test the API connection directly
const baseUrl = 'http://localhost:3002';

async function testApiConnection() {
  try {
    console.log('🔍 Testing API Connection...\n');
    
    // Test the projects API endpoint
    console.log('📡 Testing GET /api/projects...');
    const response = await fetch(`${baseUrl}/api/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response Structure:');
      console.log(`   • Success: ${data.success}`);
      console.log(`   • Message: ${data.message}`);
      console.log(`   • Projects Count: ${data.data?.length || 0}`);
      console.log(`   • Timestamp: ${data.timestamp}`);
      
      if (data.data && data.data.length > 0) {
        console.log('\n📁 Sample Project Structure:');
        const sample = data.data[0];
        console.log(`   • ID: ${sample._id}`);
        console.log(`   • Banner URL: ${sample.bannerPhotoUrl?.substring(0, 50)}...`);
        console.log(`   • Gallery Count: ${sample.gallery?.length || 0}`);
        console.log(`   • Contents Count: ${sample.contents?.length || 0}`);
        
        // Check if media is optimized
        const hasThumbnailBanner = sample.bannerPhotoUrl?.includes('thumbnail');
        const optimizedGallery = sample.gallery?.filter(url => url.includes('thumbnail')).length || 0;
        console.log(`   • Banner Optimized: ${hasThumbnailBanner ? '✅' : '❌'}`);
        console.log(`   • Gallery Optimized: ${optimizedGallery}/${sample.gallery?.length || 0}`);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API Error Response:');
      console.log(`   • Status: ${response.status}`);
      console.log(`   • Error: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    console.log('\n🔧 Possible Solutions:');
    console.log('   1. Check if dev server is running on port 3002');
    console.log('   2. Verify MongoDB connection string');
    console.log('   3. Check database models and imports');
    console.log('   4. Look for TypeScript compilation errors');
  }
}

console.log('🔍 Testing API Connection\n');
console.log('This will test the projects API endpoint directly.\n');

testApiConnection();
