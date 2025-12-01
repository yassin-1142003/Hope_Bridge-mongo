#!/usr/bin/env ts-node

/**
 * Test Script: Verify Project Media Migration
 * 
 * This script tests the migration by creating sample data, running the migration,
 * and verifying the results.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

interface TestProject {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  bannerPhotoUrl?: string;
  imageGallery?: string[];
  videoGallery?: string[];
  contents?: Array<{
    type: 'text' | 'image' | 'video';
    data: string;
    order: number;
  }>;
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

async function createTestData() {
  console.log('📝 Creating test data...');
  
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }
  
  const projectsCollection = db.collection('projects');
  
  // Clean up any existing test data
  await projectsCollection.deleteMany({ title: { $regex: /^Test Project/ } });
  
  // Create test projects with media in content
  const testProjects: TestProject[] = [
    {
      title: 'Test Project 1 - Mixed Content',
      description: 'Test project with mixed content types',
      bannerPhotoUrl: 'https://example.com/banner1.jpg',
      contents: [
        { type: 'text', data: 'This is some text content', order: 1 },
        { type: 'image', data: 'https://example.com/image1.jpg', order: 2 },
        { type: 'video', data: 'https://example.com/video1.mp4', order: 3 },
        { type: 'image', data: 'https://example.com/image2.jpg', order: 4 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Test Project 2 - Only Images',
      description: 'Test project with only images in content',
      contents: [
        { type: 'image', data: 'https://example.com/image3.jpg', order: 1 },
        { type: 'image', data: 'https://example.com/image4.jpg', order: 2 },
        { type: 'image', data: 'https://example.com/image5.jpg', order: 3 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Test Project 3 - Only Videos',
      description: 'Test project with only videos in content',
      contents: [
        { type: 'video', data: 'https://example.com/video2.mp4', order: 1 },
        { type: 'video', data: 'https://example.com/video3.mp4', order: 2 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Test Project 4 - No Media',
      description: 'Test project with no media content',
      contents: [
        { type: 'text', data: 'This is text-only content', order: 1 },
        { type: 'text', data: 'More text content here', order: 2 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Test Project 5 - Already Migrated',
      description: 'Test project with media already in main schema',
      bannerPhotoUrl: 'https://example.com/banner5.jpg',
      imageGallery: ['https://example.com/gallery1.jpg', 'https://example.com/gallery2.jpg'],
      videoGallery: ['https://example.com/gallery1.mp4'],
      contents: [
        { type: 'text', data: 'This project already has media in main schema', order: 1 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  const result = await projectsCollection.insertMany(testProjects);
  console.log(`✅ Created ${result.insertedCount} test projects`);
  
  return Object.values(result.insertedIds).map(id => id.toString());
}

async function runMigration() {
  console.log('🔄 Running migration script...');
  
  // Import and run the migration script
  const migrationModule = await import('./migrate-project-media');
  if (migrationModule.migrateProjectMedia) {
    await migrationModule.migrateProjectMedia();
  } else {
    // Run the migration directly if export doesn't work
    console.log('Running migration directly...');
    const { main } = await import('./migrate-project-media');
    await main();
  }
}

async function verifyMigration(projectIds: string[]) {
  console.log('🔍 Verifying migration results...');
  
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }
  
  const projectsCollection = db.collection('projects');
  
  const projects = await projectsCollection.find({ 
    _id: { $in: projectIds.map(id => new mongoose.Types.ObjectId(id)) }
  }).toArray() as unknown as TestProject[];
  
  console.log('\n📊 Migration Verification Results:');
  console.log('='.repeat(50));
  
  for (const project of projects) {
    console.log(`\n📋 Project: ${project.title}`);
    console.log(`   Banner Photo: ${project.bannerPhotoUrl || 'None'}`);
    console.log(`   Image Gallery: ${(project.imageGallery || []).length} items`);
    console.log(`   Video Gallery: ${(project.videoGallery || []).length} items`);
    console.log(`   Content Items: ${(project.contents || []).length} items`);
    
    // Count media types in content
    const mediaInContent = (project.contents || []).filter(c => c.type === 'image' || c.type === 'video');
    const textInContent = (project.contents || []).filter(c => c.type === 'text');
    
    console.log(`   - Media in content: ${mediaInContent.length}`);
    console.log(`   - Text in content: ${textInContent.length}`);
    
    if (mediaInContent.length > 0) {
      console.log(`   ⚠️  WARNING: ${mediaInContent.length} media items still in content!`);
    } else {
      console.log(`   ✅ All media moved to main schema`);
    }
    
    // Show details of migrated media
    if (project.imageGallery && project.imageGallery.length > 0) {
      console.log(`   📸 Images: ${project.imageGallery.join(', ')}`);
    }
    if (project.videoGallery && project.videoGallery.length > 0) {
      console.log(`   🎥 Videos: ${project.videoGallery.join(', ')}`);
    }
  }
  
  // Summary statistics
  const totalImages = projects.reduce((sum, p) => sum + (p.imageGallery?.length || 0), 0);
  const totalVideos = projects.reduce((sum, p) => sum + (p.videoGallery?.length || 0), 0);
  const totalMediaInContent = projects.reduce((sum, p) => {
    return sum + (p.contents?.filter(c => c.type === 'image' || c.type === 'video').length || 0);
  }, 0);
  
  console.log('\n📈 Summary Statistics:');
  console.log(`   - Total images in main schema: ${totalImages}`);
  console.log(`   - Total videos in main schema: ${totalVideos}`);
  console.log(`   - Total media remaining in content: ${totalMediaInContent}`);
  
  if (totalMediaInContent === 0) {
    console.log('🎉 Migration completed successfully!');
    return true;
  } else {
    console.log('❌ Migration incomplete - some media still in content');
    return false;
  }
}

async function testApiCompatibility() {
  console.log('\n🌐 Testing API compatibility...');
  
  try {
    // Test the projects API endpoint
    const response = await fetch('http://localhost:3000/api/projects', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const testProjects = data.data?.filter((p: any) => p.title?.startsWith('Test Project'));
      
      console.log(`✅ API returned ${testProjects?.length || 0} test projects`);
      
      // Check if the API response includes the new fields
      for (const project of testProjects || []) {
        console.log(`   📋 ${project.title}:`);
        console.log(`      - imageGallery: ${project.imageGallery?.length || 0} items`);
        console.log(`      - videoGallery: ${project.videoGallery?.length || 0} items`);
        console.log(`      - gallery (compat): ${project.gallery?.length || 0} items`);
        console.log(`      - contents: ${project.contents?.length || 0} items`);
      }
      
      return true;
    } else {
      console.log(`❌ API returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API test failed: ${error}`);
    return false;
  }
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');
  
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }
  
  const projectsCollection = db.collection('projects');
  
  const result = await projectsCollection.deleteMany({ title: { $regex: /^Test Project/ } });
  console.log(`✅ Deleted ${result.deletedCount} test projects`);
}

async function main() {
  console.log('🚀 Starting Project Migration Test...\n');
  
  try {
    await connectToDatabase();
    
    // Create test data
    const projectIds = await createTestData();
    
    // Run migration
    await runMigration();
    
    // Verify results
    const migrationSuccess = await verifyMigration(projectIds);
    
    // Test API compatibility
    const apiSuccess = await testApiCompatibility();
    
    // Cleanup
    await cleanupTestData();
    
    console.log('\n📋 Final Results:');
    console.log('='.repeat(30));
    console.log(`Migration: ${migrationSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`API Test: ${apiSuccess ? '✅ PASS' : '❌ FAIL'}`);
    
    if (migrationSuccess && apiSuccess) {
      console.log('\n🎉 All tests passed! Migration is ready for production.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the issues above.');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(console.error);
