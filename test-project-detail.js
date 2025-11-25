// Test project detail API and slug handling
const baseUrl = 'http://localhost:3002';

async function testProjectDetail() {
  try {
    console.log('🔍 Testing Project Detail API\n');
    
    // Test with a direct ID
    console.log('📡 Testing direct ID: 69258ac770fdbf50830d5e23');
    const directResponse = await fetch(`${baseUrl}/api/projects/69258ac770fdbf50830d5e23`);
    
    if (directResponse.ok) {
      const data = await directResponse.json();
      console.log('✅ Direct ID Response:');
      console.log(`   • Success: ${data.success}`);
      console.log(`   • Project: ${data.data?.contents?.find(c => c.language_code === 'en')?.name || 'Unknown'}`);
      console.log(`   • Banner: ${data.data?.bannerPhotoUrl?.substring(0, 50)}...`);
      console.log(`   • Gallery: ${data.data?.gallery?.length || 0} images`);
      console.log(`   • Videos: ${data.data?.contents?.find(c => c.language_code === 'en')?.videos?.length || 0} videos`);
    } else {
      console.log('❌ Direct ID Failed:', directResponse.status);
    }
    
    // Test with slug
    console.log('\n📡 Testing slug: winter-clothing-distribution-69258ac770fdbf50830d5e23');
    const slugResponse = await fetch(`${baseUrl}/api/projects/winter-clothing-distribution-69258ac770fdbf50830d5e23`);
    
    if (slugResponse.ok) {
      const data = await slugResponse.json();
      console.log('✅ Slug Response:');
      console.log(`   • Success: ${data.success}`);
      console.log(`   • Project: ${data.data?.contents?.find(c => c.language_code === 'en')?.name || 'Unknown'}`);
    } else {
      console.log('❌ Slug Failed:', slugResponse.status);
      const errorText = await slugResponse.text();
      console.log(`   • Error: ${errorText}`);
    }
    
    // Test video URL conversion
    console.log('\n🎥 Testing Video URL Conversion:');
    const testVideoUrl = 'https://drive.google.com/uc?export=view&id=1VljV13_rxtMc6IU3ienfxyLi5fk';
    const fileId = testVideoUrl.match(/id=([a-zA-Z0-9_-]+)/)?.[1];
    
    if (fileId) {
      const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      console.log(`   📹 Original: ${testVideoUrl.substring(0, 50)}...`);
      console.log(`   🎯 Embed URL: ${embedUrl}`);
      console.log(`   ✅ Video should play in iframe`);
    }
    
    console.log('\n🌐 Frontend URLs to test:');
    console.log('   • Direct ID: http://localhost:3002/en/projects/69258ac770fdbf50830d5e23');
    console.log('   • Slug URL: http://localhost:3002/en/projects/winter-clothing-distribution-69258ac770fdbf50830d5e23');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

console.log('🔍 Testing Project Detail API\n');
console.log('This will test both direct ID and slug handling.\n');

testProjectDetail();
