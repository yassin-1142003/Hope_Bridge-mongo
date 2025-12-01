#!/usr/bin/env node

/**
 * Complete Database Setup Script for HopeBridge
 * This script sets up the MongoDB database with sample data for development
 */

const { MongoClient } = require('mongodb');

// Database configuration
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity";
const DB_NAME = 'charity';

// Sample data
const sampleUsers = [
  {
    _id: "admin-user",
    name: "Admin User",
    email: "admin@hopebridge.com",
    role: "ADMIN",
    department: "Management",
    isActive: true,
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=d23e3e&color=fff",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "manager-user",
    name: "General Manager",
    email: "manager@hopebridge.com",
    role: "GENERAL_MANAGER",
    department: "Management",
    isActive: true,
    avatar: "https://ui-avatars.com/api/?name=General+Manager&background=28a745&color=fff",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "hr-user",
    name: "HR Manager",
    email: "hr@hopebridge.com",
    role: "HR",
    department: "Human Resources",
    isActive: true,
    avatar: "https://ui-avatars.com/api/?name=HR+Manager&background=007bff&color=fff",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "finance-user",
    name: "Finance Manager",
    email: "finance@hopebridge.com",
    role: "FINANCE",
    department: "Finance",
    isActive: true,
    avatar: "https://ui-avatars.com/api/?name=Finance+Manager&background=ffc107&color=000",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const sampleProjects = [
  {
    _id: "water-project",
    bannerPhotoUrl: "https://images.unsplash.com/photo-1488521787951-7083234c57eb?w=800",
    imageGallery: [
      "https://images.unsplash.com/photo-1488521787951-7083234c57eb?w=800",
      "https://images.unsplash.com/photo-1469571486292-c0f3ee937b5b?w=800",
      "https://images.unsplash.com/photo-1548191939-cbb2e3b8a3a0?w=800"
    ],
    videoGallery: [],
    contents: [
      {
        language_code: "en",
        name: "Clean Water Initiative",
        description: "Providing clean water access to rural communities",
        content: "This comprehensive project aims to provide clean drinking water to rural communities through well construction, water purification systems, and sanitation education.",
        category: "Water & Sanitation"
      },
      {
        language_code: "ar",
        name: "مبادرة المياه النظيفة",
        description: "توفير مياه نظيفة للمجتمعات الريفية",
        content: "هذا المشروع الشامل يهدف إلى توفير مياه الشرب النظيفة للمجتمعات الريفية من خلال بناء الآبار وأنظمة تنقية المياه والتعليم الصحي.",
        category: "المياه والصرف الصحي"
      }
    ],
    category: "Water & Sanitation",
    status: "active",
    targetAmount: 50000,
    raisedAmount: 32000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "education-project",
    bannerPhotoUrl: "https://images.unsplash.com/photo-1509099836639-18ba1795216c?w=800",
    imageGallery: [
      "https://images.unsplash.com/photo-1509099836639-18ba1795216c?w=800",
      "https://images.unsplash.com/photo-1520335782732-749908f5df25?w=800"
    ],
    videoGallery: [],
    contents: [
      {
        language_code: "en",
        name: "Education for All",
        description: "Supporting education in underprivileged communities",
        content: "This project provides educational resources, school supplies, and teacher training to underprivileged communities, ensuring every child has access to quality education.",
        category: "Education"
      },
      {
        language_code: "ar",
        name: "التعليم للجميع",
        description: "دعم التعليم في المجتمعات المحرومة",
        content: "هذا المشروع يوفر الموارد التعليمية والمستلزمات المدرسية وتدريب المعلمين للمجتمعات المحرومة، مما يضمن حصول كل طفل على تعليم جيد.",
        category: "التعليم"
      }
    ],
    category: "Education",
    status: "active",
    targetAmount: 75000,
    raisedAmount: 45000,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const sampleTasks = [
  {
    _id: "task-1",
    title: "Update Project Documentation",
    description: "Update the documentation for the Clean Water Initiative project with latest progress reports and photos.",
    status: "in_progress",
    priority: "medium",
    assignedTo: "admin@hopebridge.com",
    assignedToName: "Admin User",
    assignedBy: "manager@hopebridge.com",
    projectId: "water-project",
    projectName: "Clean Water Initiative",
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    attachments: [],
    comments: [
      {
        id: "comment-1",
        userId: "manager@hopebridge.com",
        userName: "General Manager",
        message: "Please include the latest photos from the field team.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    _id: "task-2",
    title: "Review Budget Allocation",
    description: "Review and approve the budget allocation for the Education for All project Q4 expenses.",
    status: "pending",
    priority: "high",
    assignedTo: "finance@hopebridge.com",
    assignedToName: "Finance Manager",
    assignedBy: "manager@hopebridge.com",
    projectId: "education-project",
    projectName: "Education for All",
    startDate: new Date(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    attachments: [
      {
        id: "attachment-1",
        name: "Q4_Budget_Proposal.pdf",
        type: "application/pdf",
        size: 2048576,
        url: "/files/Q4_Budget_Proposal.pdf"
      }
    ],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "task-3",
    title: "Organize Volunteer Training",
    description: "Organize and conduct training session for new volunteers joining the water project.",
    status: "completed",
    priority: "low",
    assignedTo: "hr@hopebridge.com",
    assignedToName: "HR Manager",
    assignedBy: "admin@hopebridge.com",
    projectId: "water-project",
    projectName: "Clean Water Initiative",
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    attachments: [],
    comments: [
      {
        id: "comment-2",
        userId: "hr@hopebridge.com",
        userName: "HR Manager",
        message: "Training completed successfully. 15 volunteers participated.",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  }
];

async function setupDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    const db = client.db(DB_NAME);
    
    // Collections to setup
    const collections = ['users', 'projects', 'tasks', 'analytics', 'audit_logs'];
    
    console.log('\n📋 Setting up collections and sample data...');
    
    // Setup Users
    console.log('👥 Setting up users...');
    await db.collection('users').deleteMany({});
    await db.collection('users').insertMany(sampleUsers);
    console.log(`✅ Inserted ${sampleUsers.length} sample users`);
    
    // Setup Projects
    console.log('🏗️ Setting up projects...');
    await db.collection('projects').deleteMany({});
    await db.collection('projects').insertMany(sampleProjects);
    console.log(`✅ Inserted ${sampleProjects.length} sample projects`);
    
    // Setup Tasks
    console.log('📝 Setting up tasks...');
    await db.collection('tasks').deleteMany({});
    await db.collection('tasks').insertMany(sampleTasks);
    console.log(`✅ Inserted ${sampleTasks.length} sample tasks`);
    
    // Setup Analytics (empty for now)
    console.log('📊 Setting up analytics...');
    await db.collection('analytics').deleteMany({});
    await db.collection('analytics').insertOne({
      _id: "system-stats",
      totalUsers: sampleUsers.length,
      totalProjects: sampleProjects.length,
      totalTasks: sampleTasks.length,
      lastUpdated: new Date()
    });
    console.log('✅ Analytics collection initialized');
    
    // Setup Audit Logs
    console.log('🔍 Setting up audit logs...');
    await db.collection('audit_logs').deleteMany({});
    console.log('✅ Audit logs collection initialized');
    
    // Verify setup
    console.log('\n🔍 Verifying database setup...');
    const userCount = await db.collection('users').countDocuments();
    const projectCount = await db.collection('projects').countDocuments();
    const taskCount = await db.collection('tasks').countDocuments();
    
    console.log(`\n📈 Database Summary:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Projects: ${projectCount}`);
    console.log(`   Tasks: ${taskCount}`);
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n🔐 Sample Users Created:');
    sampleUsers.forEach(user => {
      console.log(`   ${user.name} (${user.email}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the setup
if (require.main === module) {
  console.log('🚀 Starting HopeBridge Database Setup...\n');
  setupDatabase();
}

module.exports = { setupDatabase, sampleUsers, sampleProjects, sampleTasks };
