#!/usr/bin/env ts-node

/**
 * Database Seed Script
 * Populates the database with sample data for testing and development
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

interface User {
  name: string;
  email: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Project {
  title: string;
  description: string;
  bannerPhotoUrl: string;
  contents: Array<{
    type: 'text' | 'image' | 'video';
    data: string;
    order: number;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Post {
  title: string;
  slug: string;
  category: string;
  status: 'draft' | 'published';
  contents: Array<{
    type: string;
    data: string;
    order: number;
  }>;
  images: string[];
  videos: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Comment {
  postId: string;
  parentId: string | null;
  authorId: string;
  content: string;
  isFrozen: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not found in environment variables');
  }
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');
}

async function clearDatabase() {
  console.log('🧹 Clearing existing data...');
  
  const db = mongoose.connection.db;
  
  await db.collection('users').deleteMany({});
  await db.collection('projects').deleteMany({});
  await db.collection('posts').deleteMany({});
  await db.collection('comments').deleteMany({});
  
  console.log('✅ Database cleared');
}

async function seedUsers(): Promise<string[]> {
  console.log('👥 Seeding users...');
  
  const db = mongoose.connection.db;
  const users: User[] = [
    {
      name: 'Admin User',
      email: 'admin@hopebridge.org',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: await bcrypt.hash('password123', 12),
      role: 'USER',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      passwordHash: await bcrypt.hash('password123', 12),
      role: 'USER',
      isActive: true,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      passwordHash: await bcrypt.hash('password123', 12),
      role: 'USER',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  
  const result = await db.collection('users').insertMany(users);
  const userIds = Object.values(result.insertedIds);
  
  console.log(`✅ Seeded ${users.length} users`);
  return userIds;
}

async function seedProjects(): Promise<string[]> {
  console.log('🏗️  Seeding projects...');
  
  const db = mongoose.connection.db;
  const projects: Project[] = [
    {
      title: 'Clean Water Initiative',
      description: 'Providing clean drinking water to rural communities through sustainable filtration systems.',
      bannerPhotoUrl: 'https://images.unsplash.com/photo-1548484352-ea579e5233a8?w=800&h=400&fit=crop',
      contents: [
        {
          type: 'text',
          data: 'Our Clean Water Initiative aims to provide sustainable access to safe drinking water for communities in need. Through innovative filtration technology and community education, we\'re making a lasting impact.',
          order: 0,
        },
        {
          type: 'image',
          data: 'https://images.unsplash.com/photo-1548484352-ea579e5233a8?w=800&h=400&fit=crop',
          order: 1,
        },
        {
          type: 'text',
          data: 'Key achievements: 50+ water systems installed, 10,000+ people served, 5 communities trained in maintenance.',
          order: 2,
        },
      ],
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      title: 'Education for All',
      description: 'Building schools and providing educational resources to underserved communities.',
      bannerPhotoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
      contents: [
        {
          type: 'text',
          data: 'Education is the foundation of community development. We build schools, train teachers, and provide essential learning materials.',
          order: 0,
        },
        {
          type: 'image',
          data: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
          order: 1,
        },
        {
          type: 'text',
          data: 'Impact: 12 schools built, 200+ teachers trained, 5,000+ students educated.',
          order: 2,
        },
      ],
      isActive: true,
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-02-20'),
    },
    {
      title: 'Healthcare Access Program',
      description: 'Mobile clinics and medical assistance for remote and underserved populations.',
      bannerPhotoUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=400&fit=crop',
      contents: [
        {
          type: 'text',
          data: 'Our mobile clinics bring healthcare directly to communities that lack access to medical facilities.',
          order: 0,
        },
        {
          type: 'image',
          data: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=400&fit=crop',
          order: 1,
        },
        {
          type: 'text',
          data: 'Services include: General check-ups, vaccinations, maternal health, and health education.',
          order: 2,
        },
      ],
      isActive: true,
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-10'),
    },
    {
      title: 'Sustainable Agriculture',
      description: 'Teaching sustainable farming techniques and providing resources to local farmers.',
      bannerPhotoUrl: 'https://images.unsplash.com/photo-1590585151117-155f19cfe9b5?w=800&h=400&fit=crop',
      contents: [
        {
          type: 'text',
          data: 'We empower farmers with sustainable agriculture techniques that increase yield while protecting the environment.',
          order: 0,
        },
        {
          type: 'image',
          data: 'https://images.unsplash.com/photo-1590585151117-155f19cfe9b5?w=800&h=400&fit=crop',
          order: 1,
        },
        {
          type: 'text',
          data: 'Program includes: Training workshops, seed distribution, irrigation systems, and market access support.',
          order: 2,
        },
      ],
      isActive: true,
      createdAt: new Date('2024-04-05'),
      updatedAt: new Date('2024-04-05'),
    },
  ];
  
  const result = await db.collection('projects').insertMany(projects);
  const projectIds = Object.values(result.insertedIds);
  
  console.log(`✅ Seeded ${projects.length} projects`);
  return projectIds;
}

async function seedPosts(userIds: string[]): Promise<string[]> {
  console.log('📝 Seeding posts...');
  
  const db = mongoose.connection.db;
  const posts: Post[] = [
    {
      title: 'Welcome to HopeBridge',
      slug: 'welcome-to-hopebridge',
      category: 'announcement',
      status: 'published',
      contents: [
        {
          type: 'text',
          data: 'Welcome to HopeBridge! We are dedicated to making a positive impact in communities around the world through sustainable development projects.',
          order: 0,
        },
      ],
      images: [
        'https://images.unsplash.com/photo-1511795409834-ef43bb6f2e96?w=800&h=400&fit=crop',
      ],
      videos: [],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      title: 'Clean Water Project Launch',
      slug: 'clean-water-project-launch',
      category: 'project-update',
      status: 'published',
      contents: [
        {
          type: 'text',
          data: 'We are excited to announce the launch of our Clean Water Initiative! This project will bring clean drinking water to 50+ communities.',
          order: 0,
        },
        {
          type: 'text',
          data: 'The project includes installation of water filtration systems, community training, and ongoing maintenance support.',
          order: 1,
        },
      ],
      images: [
        'https://images.unsplash.com/photo-1548484352-ea579e5233a8?w=800&h=400&fit=crop',
      ],
      videos: [],
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      title: 'Education Milestone Reached',
      slug: 'education-milestone-reached',
      category: 'success-story',
      status: 'published',
      contents: [
        {
          type: 'text',
          data: 'We\'ve reached an incredible milestone: 5,000 students have now been educated through our Education for All program!',
          order: 0,
        },
        {
          type: 'text',
          data: 'This achievement is thanks to our dedicated teachers, generous donors, and the communities that welcome us.',
          order: 1,
        },
      ],
      images: [
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
      ],
      videos: [],
      isActive: true,
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-02-20'),
    },
    {
      title: 'Healthcare Impact Report',
      slug: 'healthcare-impact-report',
      category: 'impact-report',
      status: 'published',
      contents: [
        {
          type: 'text',
          data: 'Our Healthcare Access Program has provided medical services to over 15,000 patients this year.',
          order: 0,
        },
        {
          type: 'text',
          data: 'Key services include preventive care, treatment of common illnesses, maternal health, and health education.',
          order: 1,
        },
      ],
      images: [
        'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=400&fit=crop',
      ],
      videos: [],
      isActive: true,
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-10'),
    },
    {
      title: 'Sustainable Farming Workshop',
      slug: 'sustainable-farming-workshop',
      category: 'event',
      status: 'published',
      contents: [
        {
          type: 'text',
          data: 'Join us for our upcoming sustainable farming workshop! Learn techniques to increase crop yield while protecting the environment.',
          order: 0,
        },
        {
          type: 'text',
          data: 'Date: May 15, 2024 | Location: Community Center | Registration: Free',
          order: 1,
        },
      ],
      images: [
        'https://images.unsplash.com/photo-1590585151117-155f19cfe9b5?w=800&h=400&fit=crop',
      ],
      videos: [],
      isActive: true,
      createdAt: new Date('2024-04-05'),
      updatedAt: new Date('2024-04-05'),
    },
  ];
  
  const result = await db.collection('posts').insertMany(posts);
  const postIds = Object.values(result.insertedIds);
  
  console.log(`✅ Seeded ${posts.length} posts`);
  return postIds;
}

async function seedComments(postIds: string[], userIds: string[]) {
  console.log('💬 Seeding comments...');
  
  const db = mongoose.connection.db;
  const comments: Comment[] = [
    {
      postId: postIds[0],
      parentId: null,
      authorId: userIds[1],
      content: 'This is amazing work! Keep it up!',
      isFrozen: false,
      isDeleted: false,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      postId: postIds[0],
      parentId: null,
      authorId: userIds[2],
      content: 'How can I volunteer for this cause?',
      isFrozen: false,
      isDeleted: false,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    },
    {
      postId: postIds[0],
      parentId: null,
      authorId: userIds[3],
      content: 'Inspiring to see such positive impact in the world.',
      isFrozen: false,
      isDeleted: false,
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-04'),
    },
    {
      postId: postIds[1],
      parentId: null,
      authorId: userIds[1],
      content: 'The clean water project is exactly what our community needs!',
      isFrozen: false,
      isDeleted: false,
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
    },
    {
      postId: postIds[1],
      parentId: null,
      authorId: userIds[2],
      content: 'Will there be training for local maintenance?',
      isFrozen: false,
      isDeleted: false,
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-17'),
    },
    {
      postId: postIds[1],
      parentId: null,
      authorId: userIds[3],
      content: 'This is fantastic news! Clean water is so important.',
      isFrozen: false,
      isDeleted: false,
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18'),
    },
    {
      postId: postIds[2],
      parentId: null,
      authorId: userIds[1],
      content: 'Congratulations on reaching 5,000 students! That\'s incredible.',
      isFrozen: false,
      isDeleted: false,
      createdAt: new Date('2024-02-21'),
      updatedAt: new Date('2024-02-21'),
    },
    {
      postId: postIds[2],
      parentId: null,
      authorId: userIds[2],
      content: 'I\'m a teacher and would love to help with this program.',
      isFrozen: false,
      isDeleted: false,
      createdAt: new Date('2024-02-22'),
      updatedAt: new Date('2024-02-22'),
    },
  ];
  
  await db.collection('comments').insertMany(comments);
  
  console.log(`✅ Seeded ${comments.length} comments`);
}

async function generateSeedReport() {
  console.log('📊 Generating seed report...');
  
  const db = mongoose.connection.db;
  
  const userCount = await db.collection('users').countDocuments();
  const projectCount = await db.collection('projects').countDocuments();
  const postCount = await db.collection('posts').countDocuments();
  const commentCount = await db.collection('comments').countDocuments();
  
  console.log(`📈 Database Statistics:`);
  console.log(`  - Users: ${userCount}`);
  console.log(`  - Projects: ${projectCount}`);
  console.log(`  - Posts: ${postCount}`);
  console.log(`  - Comments: ${commentCount}`);
  
  // Show sample data
  const sampleUser = await db.collection('users').findOne({ role: 'ADMIN' });
  console.log(`\n🔑 Admin Login:`);
  console.log(`  - Email: ${sampleUser?.email}`);
  console.log(`  - Password: admin123`);
  
  const sampleProject = await db.collection('projects').findOne();
  console.log(`\n🏗️  Sample Project: ${sampleProject?.title}`);
  
  const samplePost = await db.collection('posts').findOne();
  console.log(`\n📝 Sample Post: ${samplePost?.title}`);
}

async function main() {
  console.log('🚀 Starting database seed script...\n');
  
  try {
    await connectToDatabase();
    
    await clearDatabase();
    const userIds = await seedUsers();
    const projectIds = await seedProjects();
    const postIds = await seedPosts(userIds);
    await seedComments(postIds, userIds);
    await generateSeedReport();
    
    console.log('\n✅ Database seed script completed successfully');
  } catch (error) {
    console.error('\n❌ Database seed script failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(console.error);
