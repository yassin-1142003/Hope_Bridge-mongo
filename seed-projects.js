// Sample data seeding script for MongoDB projects
const mongoose = require('mongoose');

// Connect to MongoDB
const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

// Sample project data
const sampleProjects = [
  {
    bannerPhotoUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
    gallery: [],
    contents: [
      {
        language_code: "en",
        name: "Clean Water Initiative",
        description: "Providing clean drinking water to rural communities",
        content: "Our clean water initiative aims to provide sustainable access to safe drinking water for rural communities. Through innovative water purification systems and community education, we're making a lasting impact on public health.",
        images: [],
        videos: [],
        documents: []
      },
      {
        language_code: "ar",
        name: "مبادرة المياه النظيفة",
        description: "توفير مياه الشرب النظيفة للمجتمعات الريفية",
        content: "تهدف مبادرة المياه النظيفة الخاصة بنا إلى توفير وصول مستدام لمياه الشرب الآمنة للمجتمعات الريفية. من خلال أنظمة تنقية المياه المبتكرة والتعليم المجتمعي، نحن نحدث تأثيرًا دائمًا على الصحة العامة.",
        images: [],
        videos: [],
        documents: []
      }
    ]
  },
  {
    bannerPhotoUrl: "https://images.unsplash.com/photo-1509099836667-42cc6e496c7a?w=800",
    gallery: [],
    contents: [
      {
        language_code: "en",
        name: "Education for All",
        description: "Building schools and providing educational resources",
        content: "Education is the foundation of progress. We're building schools, providing educational materials, and training teachers to ensure every child has access to quality education regardless of their background.",
        images: [],
        videos: [],
        documents: []
      },
      {
        language_code: "ar",
        name: "التعليم للجميع",
        description: "بناء المدارس وتوفير الموارد التعليمية",
        content: "التعليم هو أساس التقدم. نحن نبني المدارس ونوفر المواد التعليمية وندرب المعلمين لضمان حصول كل طفل على تعليم جيد بغض النظر عن خلفيته.",
        images: [],
        videos: [],
        documents: []
      }
    ]
  },
  {
    bannerPhotoUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
    gallery: [],
    contents: [
      {
        language_code: "en",
        name: "Healthcare Access",
        description: "Mobile clinics and medical assistance programs",
        content: "Our healthcare programs bring medical services directly to underserved communities through mobile clinics, health education, and partnerships with local healthcare providers.",
        images: [],
        videos: [],
        documents: []
      },
      {
        language_code: "ar",
        name: "الوصول إلى الرعاية الصحية",
        description: "العيادات المتنقلة وبرامج المساعدة الطبية",
        content: "تجلب برامج الرعاية الصحية الخاصة بنا الخدمات الطبية مباشرة إلى المجتمعات التي تفتقر إلى الخدمات من خلال العيادات المتنقلة والتعليم الصحي والشراكات مع مقدمي الرعاية الصحية المحليين.",
        images: [],
        videos: [],
        documents: []
      }
    ]
  }
];

// Project schema (simplified version)
const projectSchema = new mongoose.Schema({
  bannerPhotoUrl: String,
  gallery: [String],
  created_at: { type: Date, default: Date.now },
  contents: [{
    language_code: String,
    name: String,
    description: String,
    content: String,
    images: [String],
    videos: [String],
    documents: [String]
  }]
});

const Project = mongoose.model('Project', projectSchema);

async function seedProjects() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB');

    // Clear existing projects (optional)
    const clearExisting = process.argv.includes('--clear');
    if (clearExisting) {
      await Project.deleteMany({});
      console.log('🗑️ Cleared existing projects');
    }

    // Insert sample projects
    const insertedProjects = await Project.insertMany(sampleProjects);
    console.log(`✅ Successfully inserted ${insertedProjects.length} projects`);

    // Display inserted projects
    insertedProjects.forEach((project, index) => {
      console.log(`\n📋 Project ${index + 1}:`);
      console.log(`   ID: ${project._id}`);
      console.log(`   Name: ${project.contents[0]?.name}`);
      console.log(`   Description: ${project.contents[0]?.description}`);
    });

    console.log('\n🎉 Projects are now available in your MongoDB database!');
    console.log('💡 They should appear in your project listing page');

  } catch (error) {
    console.error('❌ Error seeding projects:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

console.log('🌱 MongoDB Project Seeding Script');
console.log('Usage: node seed-projects.js [--clear to remove existing data]');
console.log('');

seedProjects();
