import { getCollection } from './lib/mongodb.js';

async function addTestProject() {
  try {
    const projectsCollection = await getCollection('projects');
    
    const testProject = {
      contents: [
        {
          language_code: "en",
          name: "Clean Water Initiative",
          description: "Providing clean drinking water to rural communities",
          content: "This project aims to install water purification systems in rural areas, ensuring access to clean drinking water for over 10,000 people.",
          images: [],
          videos: [],
          documents: []
        },
        {
          language_code: "ar",
          name: "مبادرة المياه النظيفة",
          description: "توفير مياه الشرب النظيفة للمجتمعات الريفية",
          content: "تهدف هذه المبادرة إلى تركيب أنظمة تنقية المياه في المناطق الريفية، مما يضمن الوصول إلى مياه الشرب النظيفة لأكثر من 10000 شخص.",
          images: [],
          videos: [],
          documents: []
        }
      ],
      bannerPhotoUrl: "https://images.unsplash.com/photo-1548206091-80c97422c2e8?w=800&h=400&fit=crop",
      gallery: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await projectsCollection.insertOne(testProject);
    console.log('✅ Test project added successfully with ID:', result.insertedId);
    
    // Add another project
    const secondProject = {
      contents: [
        {
          language_code: "en",
          name: "Education for All",
          description: "Building schools and providing educational resources",
          content: "We are building schools in underserved communities and providing educational materials to ensure every child has access to quality education.",
          images: [],
          videos: [],
          documents: []
        },
        {
          language_code: "ar",
          name: "التعليم للجميع",
          description: "بناء المدارس وتوفير الموارد التعليمية",
          content: "نحن نبني المدارس في المجتمعات المحرومة ونوفر المواد التعليمية لضمان حصول كل طفل على تعليم جيد.",
          images: [],
          videos: [],
          documents: []
        }
      ],
      bannerPhotoUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=400&fit=crop",
      gallery: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const secondResult = await projectsCollection.insertOne(secondProject);
    console.log('✅ Second project added successfully with ID:', secondResult.insertedId);
    
    console.log('\n🎉 Both projects added to database successfully!');
    
  } catch (error) {
    console.error('❌ Error adding projects:', error);
  } finally {
    process.exit(0);
  }
}

addTestProject();
