import { MongoClient } from 'mongodb';

// MongoDB connection string from your .env.local
const uri = "mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity";
const dbName = "charity";

async function addTestProjects() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    const projectsCollection = db.collection('projects');
    
    const testProjects = [
      {
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
      },
      {
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
      },
      {
        contents: [
          {
            language_code: "en",
            name: "Healthcare Access Program",
            description: "Providing medical care to remote communities",
            content: "Our mobile clinics bring essential healthcare services to remote areas, serving communities that lack access to medical facilities.",
            images: [],
            videos: [],
            documents: []
          },
          {
            language_code: "ar",
            name: "برنامج الوصول إلى الرعاية الصحية",
            description: "توفير الرعاية الطبية للمجتمعات النائية",
            content: "تجلب عياداتنا المتنقلة خدمات الرعاية الصحية الأساسية إلى المناطق النائية، وتخدم المجتمعات التي تفتقر إلى الوصول إلى المرافق الطبية.",
            images: [],
            videos: [],
            documents: []
          }
        ],
        bannerPhotoUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=400&fit=crop",
        gallery: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Insert all projects
    const result = await projectsCollection.insertMany(testProjects);
    console.log(`✅ Successfully added ${result.insertedCount} projects to the database!`);
    console.log('Project IDs:', result.insertedIds);
    
    // Verify the insertion
    const count = await projectsCollection.countDocuments();
    console.log(`📊 Total projects in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Error adding projects:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

addTestProjects();
