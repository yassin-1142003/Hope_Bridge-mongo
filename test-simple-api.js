// Test the simplified API route
const baseUrl = 'http://localhost:3002';

async function testSimpleApi() {
  try {
    console.log('🔍 Testing Simplified API Route...\n');
    
    // Test the simplified projects API endpoint
    console.log('📡 Testing GET /api/projects-test...');
    const response = await fetch(`${baseUrl}/api/projects-test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Simplified API Response:');
      console.log(`   • Success: ${data.success}`);
      console.log(`   • Message: ${data.message}`);
      console.log(`   • Projects Count: ${data.data?.length || 0}`);
      
      if (data.data && data.data.length > 0) {
        console.log('\n📁 First Project Details:');
        const sample = data.data[0];
        console.log(`   • ID: ${sample.id}`);
        console.log(`   • ID Type: ${typeof sample.id}`);
        console.log(`   • Banner URL: ${sample.bannerPhotoUrl?.substring(0, 50)}...`);
        console.log(`   • Gallery Count: ${sample.gallery?.length || 0}`);
        console.log(`   • Contents Count: ${sample.contents?.length || 0}`);
        
        // Check if media is optimized
        const hasThumbnailBanner = sample.bannerPhotoUrl?.includes('thumbnail');
        const optimizedGallery = sample.gallery?.filter(url => url.includes('thumbnail')).length || 0;
        console.log(`   • Banner Optimized: ${hasThumbnailBanner ? '✅' : '❌'}`);
        console.log(`   • Gallery Optimized: ${optimizedGallery}/${sample.gallery?.length || 0}`);
        
        console.log('\n🎯 If this works, the issue is in ProjectService');
        console.log('🔧 Next steps:');
        console.log('   1. Check ProjectService imports');
        console.log('   2. Look for TypeScript compilation errors');
        console.log('   3. Check toProject function');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Simplified API Error:');
      console.log(`   • Status: ${response.status}`);
      console.log(`   • Error: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
  }
}

console.log('🔍 Testing Simplified API Route\n');
console.log('This will test if the issue is in ProjectService.\n');

testSimpleApi();
