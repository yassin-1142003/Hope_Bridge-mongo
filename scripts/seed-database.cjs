/**
 * Seed Database Script
 * Populates the database with example content for testing the admin panel
 */

const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/hopebridge');
    await client.connect();
    
    const db = client.db('hopebridge');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.collection('users').deleteMany({});
    await db.collection('posts').deleteMany({});
    await db.collection('projects').deleteMany({});
    
    // 1. Create Users
    console.log('👥 Creating users...');
    const usersCollection = db.collection('users');
    
    const users = [
      {
        name: 'Admin User',
        email: 'admin@hopebridge.org',
        passwordHash: await bcrypt.hash('admin123', 12),
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: await bcrypt.hash('user123', 12),
        role: 'USER',
        isActive: true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        passwordHash: await bcrypt.hash('user123', 12),
        role: 'USER',
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const userResults = await usersCollection.insertMany(users);
    console.log(`✅ Created ${userResults.insertedCount} users`);
    
    // 2. Create Projects
    console.log('🏗️ Creating projects...');
    const projectsCollection = db.collection('projects');
    
    const projects = [
      {
        contents: [
          {
            language_code: 'en',
            name: 'Clean Water Initiative',
            description: 'Providing clean drinking water to rural communities in need',
            content: 'Our Clean Water Initiative aims to provide sustainable access to safe drinking water for communities that lack basic water infrastructure. Through installation of water purification systems and community education programs, we have helped over 10,000 people gain access to clean water.',
            images: [
              'https://picsum.photos/seed/water1/800/600.jpg',
              'https://picsum.photos/seed/water2/800/600.jpg'
            ],
            videos: [
              'https://www.youtube.com/watch?v=example1'
            ],
            documents: []
          }
        ],
        bannerPhotoUrl: 'https://picsum.photos/seed/water-banner/1200/400.jpg',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        contents: [
          {
            language_code: 'en',
            name: 'Education for All',
            description: 'Building schools and providing educational resources to underprivileged children',
            content: 'Education for All is dedicated to breaking the cycle of poverty through education. We build schools, provide learning materials, and train teachers in underserved communities. Our programs have reached over 5,000 children, giving them hope for a brighter future.',
            images: [
              'https://picsum.photos/seed/education1/800/600.jpg',
              'https://picsum.photos/seed/education2/800/600.jpg',
              'https://picsum.photos/seed/education3/800/600.jpg'
            ],
            videos: [],
            documents: []
          }
        ],
        bannerPhotoUrl: 'https://picsum.photos/seed/education-banner/1200/400.jpg',
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-02-20')
      },
      {
        contents: [
          {
            language_code: 'en',
            name: 'Medical Aid Program',
            description: 'Providing essential medical supplies and healthcare to remote areas',
            content: 'Our Medical Aid Program brings healthcare to remote and underserved communities. We organize medical camps, provide essential medicines, and train local health workers. This initiative has saved countless lives and improved health outcomes for thousands of people.',
            images: [
              'https://picsum.photos/seed/medical1/800/600.jpg'
            ],
            videos: [
              'https://www.youtube.com/watch?v=example2'
            ],
            documents: []
          }
        ],
        bannerPhotoUrl: 'https://picsum.photos/seed/medical-banner/1200/400.jpg',
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-10')
      }
    ];
    
    const projectResults = await projectsCollection.insertMany(projects);
    console.log(`✅ Created ${projectResults.insertedCount} projects`);
    
    // 3. Create Posts
    console.log('📝 Creating posts...');
    const postsCollection = db.collection('posts');
    
    const posts = [
      {
        contents: [
          {
            language_code: 'en',
            name: 'Water Project Milestone Reached',
            description: 'We successfully completed our 100th water installation',
            content: 'Today marks a significant milestone for our Clean Water Initiative. We have successfully installed our 100th water purification system, bringing clean water to over 10,000 people across 25 villages. This achievement would not have been possible without the generous support of our donors and the hard work of our dedicated team.',
            images: [
              'https://picsum.photos/seed/milestone1/800/600.jpg',
              'https://picsum.photos/seed/milestone2/800/600.jpg'
            ],
            videos: []
          }
        ],
        category: 'milestone',
        status: 'published',
        slug: 'water-project-milestone-reached',
        createdAt: new Date('2024-01-28'),
        updatedAt: new Date('2024-01-28')
      },
      {
        contents: [
          {
            language_code: 'en',
            name: 'Volunteer Appreciation Month',
            description: 'Celebrating our amazing volunteers who make everything possible',
            content: 'This month, we celebrate the incredible volunteers who are the backbone of our organization. From teaching children to installing water systems, our volunteers give their time and skills selflessly. We want to extend our heartfelt gratitude to each and every one of you.',
            images: [
              'https://picsum.photos/seed/volunteers1/800/600.jpg',
              'https://picsum.photos/seed/volunteers2/800/600.jpg',
              'https://picsum.photos/seed/volunteers3/800/600.jpg'
            ],
            videos: []
          }
        ],
        category: 'announcement',
        status: 'published',
        slug: 'volunteer-appreciation-month',
        createdAt: new Date('2024-02-14'),
        updatedAt: new Date('2024-02-14')
      },
      {
        contents: [
          {
            language_code: 'en',
            name: 'New School Opening Ceremony',
            description: 'Join us as we celebrate the opening of our newest school',
            content: 'We are thrilled to announce the opening of our newest school in the rural community of Green Valley. This school will serve over 200 children who previously had to walk miles to reach the nearest school. The opening ceremony will be attended by local officials, parents, and supporters.',
            images: [
              'https://picsum.photos/seed/school1/800/600.jpg'
            ],
            videos: []
          }
        ],
        category: 'event',
        status: 'draft',
        slug: 'new-school-opening-ceremony',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01')
      },
      {
        contents: [
          {
            language_code: 'en',
            name: 'Emergency Medical Relief',
            description: 'Rapid response to health crisis in affected areas',
            content: 'In response to the recent health crisis in several rural communities, our medical team has been working around the clock to provide emergency medical relief. We have distributed essential medicines, set up temporary clinics, and trained local health workers to continue the care.',
            images: [
              'https://picsum.photos/seed/relief1/800/600.jpg',
              'https://picsum.photos/seed/relief2/800/600.jpg'
            ],
            videos: []
          }
        ],
        category: 'emergency',
        status: 'published',
        slug: 'emergency-medical-relief',
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      },
      {
        contents: [
          {
            language_code: 'en',
            name: 'Annual Charity Gala Success',
            description: 'Our fundraising event exceeded all expectations',
            content: 'The Annual Charity Gala was a tremendous success! Thanks to our generous donors and supporters, we raised over $100,000 to fund our various projects. The evening featured inspiring stories from beneficiaries, live performances, and a silent auction. These funds will directly impact thousands of lives.',
            images: [
              'https://picsum.photos/seed/gala1/800/600.jpg',
              'https://picsum.photos/seed/gala2/800/600.jpg',
              'https://picsum.photos/seed/gala3/800/600.jpg',
              'https://picsum.photos/seed/gala4/800/600.jpg'
            ],
            videos: []
          }
        ],
        category: 'fundraising',
        status: 'published',
        slug: 'annual-charity-gala-success',
        createdAt: new Date('2024-02-28'),
        updatedAt: new Date('2024-02-28')
      }
    ];
    
    const postResults = await postsCollection.insertMany(posts);
    console.log(`✅ Created ${postResults.insertedCount} posts`);
    
    // Summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${userResults.insertedCount}`);
    console.log(`   🏗️ Projects: ${projectResults.insertedCount}`);
    console.log(`   📝 Posts: ${postResults.insertedCount}`);
    
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin: admin@hopebridge.org / admin123');
    console.log('   User: john@example.com / user123');
    console.log('   User: jane@example.com / user123');
    
    console.log('\n🌐 Access Points:');
    console.log('   Main Site: http://localhost:3000');
    console.log('   Admin Panel: http://localhost:3000/admin');
    console.log('   Sign In: http://localhost:3000/auth/signin');
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config();

// Run the script
seedDatabase().then(() => {
  console.log('🎉 Seeding completed!');
  process.exit(0);
});
