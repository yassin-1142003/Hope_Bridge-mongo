// Create a working project with proper content structure
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function createWorkingProject() {
  console.log('🚀 Creating Working Project with Proper Content...\n');

  const workingProject = {
    bannerPhotoUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
    contents: [
      {
        language_code: "en",
        name: "Working Test Project",
        description: "A fully functional test project",
        content: "This project has proper content structure and should appear in both English and Arabic versions of the website.",
        images: [],
        videos: [],
        documents: []
      },
      {
        language_code: "ar",
        name: "مشروع اختبار عامل",
        description: "مشروع اختبار وظيفي بالكامل",
        content: "هذا المشروع له بنية محتوى مناسبة ويجب أن يظهر في كل من النسخة الإنجليزية والعربية من الموقع.",
        images: [],
        videos: [],
        documents: []
      }
    ]
  };

  try {
    console.log('📤 Sending POST request to /api/test-projects (no auth required)');
    console.log('📋 Project structure:', JSON.stringify(workingProject, null, 2));
    
    const response = await fetch(`${BASE_URL}/api/test-projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workingProject)
    });

    console.log(`📡 Response status: ${response.status}`);
    
    const data = await response.json();
    console.log('📄 Response:', JSON.stringify(data, null, 2));

    if (response.status === 201 && data.success) {
      console.log('\n✅ SUCCESS! Project created with 201 status');
      console.log(`🆔 Project ID: ${data.data.id}`);
      console.log(`📝 English name: ${data.data.contents[0].name}`);
      console.log(`📝 Arabic name: ${data.data.contents[1].name}`);
      
      // Test if it appears in the main list
      console.log('\n🔍 Testing if project appears in main API...');
      const listResponse = await fetch(`${BASE_URL}/api/projects`);
      const listData = await listResponse.json();
      
      console.log(`📊 Total projects: ${listData.data?.length || 0}`);
      
      const newProject = listData.data?.find(p => p.id === data.data.id);
      if (newProject) {
        console.log('✅ Project found in main list!');
        console.log('🎉 Visit http://localhost:3000/en/projects to see it');
        console.log('🎉 Visit http://localhost:3000/ar/projects to see Arabic version');
      } else {
        console.log('❌ Project not found in main list');
      }
      
      // Test the frontend filtering
      const englishProjects = listData.data?.filter(p => 
        p.contents && p.contents.some(c => c.language_code === 'en' && c.name)
      );
      console.log(`📝 Projects available in English: ${englishProjects?.length || 0}`);
      
    } else {
      console.log('\n❌ FAILED to create project');
      console.log(`Status: ${response.status}`);
      console.log(`Error: ${data.error}`);
      if (data.details) console.log(`Details: ${data.details}`);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

console.log('🎯 This will create a project with proper content structure\n');
console.log('💡 Make sure your dev server is running: npm run dev\n');

createWorkingProject();
