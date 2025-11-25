// Test script to verify project APIs are working with MongoDB data
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testProjectAPIs() {
  console.log('🧪 Testing Project APIs...\n');

  try {
    // Test 1: Get all projects
    console.log('📋 Testing GET /api/projects');
    const allProjectsResponse = await fetch(`${BASE_URL}/api/projects`);
    const allProjectsData = await allProjectsResponse.json();
    
    console.log('Status:', allProjectsResponse.status);
    console.log('Response:', JSON.stringify(allProjectsData, null, 2));
    
    if (allProjectsData.success && allProjectsData.data) {
      console.log(`✅ Found ${allProjectsData.data.length} projects`);
      
      // Test 2: Get individual project if any exist
      if (allProjectsData.data.length > 0) {
        const firstProject = allProjectsData.data[0];
        console.log(`\n🔍 Testing GET /api/projects/${firstProject.id}`);
        
        const singleProjectResponse = await fetch(`${BASE_URL}/api/projects/${firstProject.id}`);
        const singleProjectData = await singleProjectResponse.json();
        
        console.log('Status:', singleProjectResponse.status);
        console.log('Response:', JSON.stringify(singleProjectData, null, 2));
        
        if (singleProjectData.success) {
          console.log('✅ Individual project retrieved successfully');
        } else {
          console.log('❌ Failed to retrieve individual project');
        }
      }
    } else {
      console.log('❌ Failed to retrieve projects');
    }

    // Test 3: Test with media endpoint
    console.log('\n📸 Testing GET /api/media');
    const mediaResponse = await fetch(`${BASE_URL}/api/media`);
    const mediaData = await mediaResponse.json();
    
    console.log('Status:', mediaResponse.status);
    console.log('Response:', JSON.stringify(mediaData, null, 2));

  } catch (error) {
    console.error('❌ Error testing APIs:', error.message);
  }
}

// Instructions for running this test
console.log('📝 Instructions:');
console.log('1. Make sure your Next.js dev server is running (npm run dev)');
console.log('2. Add some project data in MongoDB Compass');
console.log('3. Run: node test-projects-api.js');
console.log('\n⚡ Running tests...\n');

testProjectAPIs();
