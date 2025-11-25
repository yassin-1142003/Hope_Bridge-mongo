// Simple script to create a test project and get 201 response
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function createTestProject() {
  console.log('🚀 Creating Test Project (No Auth Required)...\n');

  const testProject = {
    bannerPhotoUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
    contents: [
      {
        language_code: "en",
        name: "Test Project - API Created",
        description: "A test project created via API to verify 201 response",
        content: "This project was created through the API to test the creation functionality. It should appear in the project listing.",
        images: [],
        videos: [],
        documents: []
      },
      {
        language_code: "ar",
        name: "مشروع اختبار - تم إنشاؤه عبر API",
        description: "مشروع اختبار تم إنشاؤه عبر API للتحقق من استجابة 201",
        content: "تم إنشاء هذا المشروع عبر API لاختبار وظيفة الإنشاء. يجب أن يظهر في قائمة المشاريع.",
        images: [],
        videos: [],
        documents: []
      }
    ]
  };

  try {
    console.log('📤 Sending POST request to /api/test-projects (no auth)');
    console.log('📋 Project data:', JSON.stringify(testProject, null, 2));
    
    const response = await fetch(`${BASE_URL}/api/test-projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProject)
    });

    console.log(`📡 Response status: ${response.status}`);
    
    const data = await response.json();
    console.log('📄 Response body:', JSON.stringify(data, null, 2));

    if (response.status === 201 && data.success) {
      console.log('✅ SUCCESS! Project created with 201 status');
      console.log(`🆔 Project ID: ${data.data.id}`);
      console.log(`📝 Project name: ${data.data.contents[0].name}`);
      
      // Verify it appears in the main list
      console.log('\n🔍 Verifying project appears in main list...');
      const listResponse = await fetch(`${BASE_URL}/api/projects`);
      const listData = await listResponse.json();
      
      console.log(`📊 Total projects in database: ${listData.data?.length || 0}`);
      
      const newProject = listData.data?.find(p => p.id === data.data.id);
      if (newProject) {
        console.log('✅ Project found in the main list!');
        console.log('🎉 Your frontend should now show this project');
      } else {
        console.log('❌ Project not found in main list');
      }
    } else {
      console.log('❌ FAILED to create project');
      console.log(`Status: ${response.status}`);
      console.log(`Error: ${data.error}`);
      if (data.details) console.log(`Details: ${data.details}`);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

console.log('📝 Make sure your dev server is running: npm run dev\n');
console.log('💡 If you get authentication errors, make sure you are logged in as admin\n');

createTestProject();
