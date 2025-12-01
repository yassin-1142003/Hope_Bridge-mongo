// Script to add sample projects to MongoDB
const { MongoClient } = require('mongodb');

const sampleProjects = [
  {
    bannerPhotoUrl: "https://images.unsplash.com/photo-1488521787951-7083234c57eb?w=800",
    imageGallery: [
      "https://images.unsplash.com/photo-1488521787951-7083234c57eb?w=800",
      "https://images.unsplash.com/photo-1469571486292-c0f3ee937b5b?w=800"
    ],
    contents: [
      {
        language_code: "en",
        name: "Clean Water Project",
        description: "Providing clean water to needy areas",
        content: "This project aims to provide clean and safe water to needy areas through water purification systems and well construction."
      },
      {
        language_code: "ar",
        name: "مشروع المياه النظيفة",
        description: "توفير مياه نظيفة للمناطق المحتاجة",
        content: "هذا المشروع يهدف إلى توفير مياه نظيفة وآمنة للمناطق المحتاجة من خلال أنظمة تنقية المياه وبناء الآبار."
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    bannerPhotoUrl: "https://images.unsplash.com/photo-1509099836639-18ba1795216c?w=800",
    imageGallery: [
      "https://images.unsplash.com/photo-1509099836639-18ba1795216c?w=800",
      "https://images.unsplash.com/photo-1520335782732-749908f5df25?w=800"
    ],
    contents: [
      {
        language_code: "en",
        name: "Education Project",
        description: "Supporting education for needy children",
        content: "This project aims to support education for children in needy areas by providing school supplies, books, and educational resources."
      },
      {
        language_code: "ar",
        name: "مشروع التعليم",
        description: "دعم التعليم للأطفال المحتاجين",
        content: "هذا المشروع يهدف إلى دعم التعليم للأطفال في المناطق المحتاجة من خلال توفير المستلزمات المدرسية والكتب والموارد التعليمية."
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function addSampleProjects() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('charity');
    const collection = db.collection('projects');
    
    // Clear existing projects
    await collection.deleteMany({});
    console.log('Cleared existing projects');
    
    // Insert sample projects
    const result = await collection.insertMany(sampleProjects);
    console.log(`Inserted ${result.insertedCount} sample projects`);
    
    // Verify insertion
    const count = await collection.countDocuments();
    console.log(`Total projects in database: ${count}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

addSampleProjects();
