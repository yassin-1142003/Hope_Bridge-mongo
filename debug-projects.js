// Debug script to test project creation and identify issues
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function debugProjectCreation() {
  console.log('🔍 Debugging Project Creation API...\n');

  try {
    // Test 1: Check if projects API is working
    console.log('1️⃣ Testing GET /api/projects');
    const getResponse = await fetch(`${BASE_URL}/api/projects`);
    const getData = await getResponse.json();
    console.log('Status:', getResponse.status);
    console.log('Current projects:', getData.data?.length || 0);
    console.log('Response structure:', JSON.stringify(getData, null, 2));

    // Test 2: Try to create a simple project (JSON)
    console.log('\n2️⃣ Testing POST /api/projects with JSON');
    
    const simpleProject = {
      bannerPhotoUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
      contents: [
        {
          language_code: "en",
          name: "Test Project",
          description: "A test project for debugging",
          content: "This is a test project created via API",
          images: [],
          videos: [],
          documents: []
        },
        {
          language_code: "ar",
          name: "مشروع اختبار",
          description: "مشروع اختبار للتصحيح",
          content: "هذا مشروع اختبار تم إنشاؤه عبر API",
          images: [],
          videos: [],
          documents: []
        }
      ]
    };

    const postResponse = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simpleProject)
    });

    const postData = await postResponse.json();
    console.log('Status:', postResponse.status);
    console.log('Response:', JSON.stringify(postData, null, 2));

    // Test 3: Check if project was created
    console.log('\n3️⃣ Verifying project creation...');
    const verifyResponse = await fetch(`${BASE_URL}/api/projects`);
    const verifyData = await verifyResponse.json();
    console.log('Projects after creation:', verifyData.data?.length || 0);

    if (verifyData.data?.length > getData.data?.length) {
      console.log('✅ Project successfully created!');
      console.log('New project:', verifyData.data[verifyData.data.length - 1]);
    } else {
      console.log('❌ Project was not created');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test with FormData (for file uploads)
async function testFormDataProject() {
  console.log('\n4️⃣ Testing POST /api/projects with FormData');
  
  try {
    const FormData = require('form-data');
    const fs = require('fs');
    
    const formData = new FormData();
    
    const projectData = {
      bannerPhotoUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
      contents: [
        {
          language_code: "en",
          name: "FormData Test Project",
          description: "Testing with FormData",
          content: "Project created using FormData",
          images: [],
          videos: [],
          documents: []
        }
      ]
    };
    
    formData.append('projectData', JSON.stringify(projectData));
    
    const postResponse = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const postData = await postResponse.json();
    console.log('FormData Status:', postResponse.status);
    console.log('FormData Response:', JSON.stringify(postData, null, 2));
    
  } catch (error) {
    console.error('❌ FormData Error:', error.message);
  }
}

console.log('🚀 Starting Project Creation Debug...\n');
console.log('📝 Make sure your dev server is running: npm run dev\n');

debugProjectCreation().then(() => {
  testFormDataProject();
});
