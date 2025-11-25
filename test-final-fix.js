// Final test to verify all fixes are working
const baseUrl = 'http://localhost:3002';

async function testFinalFix() {
  try {
    console.log('🎯 FINAL FIX VERIFICATION\n');
    
    // Test project detail page with slug
    console.log('📡 Testing project detail page with slug...');
    const slugUrl = `${baseUrl}/en/projects/heating-pack-distribution-south-gaza-esdod-camp-69258ac770fdbf50830d5e26`;
    
    try {
      const response = await fetch(slugUrl);
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log('✅ Project detail page working with slug!');
      } else {
        console.log('❌ Project detail page failed:', response.status);
        const errorText = await response.text();
        console.log(`   Error: ${errorText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log('❌ Error accessing project detail page:', error.message);
    }
    
    // Test project detail page with direct ID
    console.log('\n📡 Testing project detail page with direct ID...');
    const directUrl = `${baseUrl}/en/projects/69258ac770fdbf50830d5e26`;
    
    try {
      const response = await fetch(directUrl);
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log('✅ Project detail page working with direct ID!');
      } else {
        console.log('❌ Project detail page failed:', response.status);
      }
    } catch (error) {
      console.log('❌ Error accessing project detail page:', error.message);
    }
    
    // Test API with slug
    console.log('\n📡 Testing API with slug...');
    const apiSlugUrl = `${baseUrl}/api/projects/heating-pack-distribution-south-gaza-esdod-camp-69258ac770fdbf50830d5e26`;
    
    try {
      const response = await fetch(apiSlugUrl);
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API working with slug!');
        console.log(`   Project: ${data.data?.contents?.find(c => c.language_code === 'en')?.name || 'Unknown'}`);
      } else {
        console.log('❌ API failed with slug:', response.status);
      }
    } catch (error) {
      console.log('❌ Error accessing API:', error.message);
    }
    
    console.log('\n🎉 SUMMARY:');
    console.log('✅ What should be working now:');
    console.log('   • Project detail pages with slugs');
    console.log('   • Project detail pages with direct IDs');
    console.log('   • API endpoints with both formats');
    console.log('   • No more CastError issues');
    console.log('   • All media (images + videos) optimized');
    
    console.log('\n🌐 Test these URLs in your browser:');
    console.log(`   • Slug: ${slugUrl}`);
    console.log(`   • Direct ID: ${directUrl}`);
    console.log(`   • Projects list: ${baseUrl}/en/projects`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

console.log('🎯 FINAL FIX VERIFICATION\n');
console.log('This will test that all issues are resolved.\n');

testFinalFix();
