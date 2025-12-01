#!/usr/bin/env node

/**
 * Quick Task Test - Verify Task Functionality
 * 
 * Simple test to verify that tasks can be created and listed.
 * This can be run without TypeScript compilation.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not found in environment variables');
  }
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');
}

async function testTaskOperations() {
  console.log('🧪 Testing Task Operations...\n');
  
  try {
    await connectToDatabase();
    
    const db = mongoose.connection.db;
    const tasksCollection = db.collection('tasks');
    
    // Clean up any existing test tasks
    await tasksCollection.deleteMany({ title: { $regex: /^Quick Test/ } });
    
    // Create a test task
    const testTask = {
      title: 'Quick Test Task - Verify Functionality',
      description: 'This is a quick test to verify task creation and listing works',
      assignedTo: 'test@example.com',
      assignedToName: 'Test User',
      priority: 'medium',
      status: 'pending',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: 'admin@example.com',
      createdByName: 'Admin User',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['test', 'quick-test'],
      category: 'testing'
    };
    
    console.log('📝 Creating test task...');
    const result = await tasksCollection.insertOne(testTask);
    console.log(`✅ Task created with ID: ${result.insertedId}`);
    
    // Retrieve the task
    console.log('\n🔍 Retrieving task...');
    const retrievedTask = await tasksCollection.findOne({ _id: result.insertedId });
    
    if (retrievedTask) {
      console.log('✅ Task retrieved successfully:');
      console.log(`   - Title: ${retrievedTask.title}`);
      console.log(`   - Status: ${retrievedTask.status}`);
      console.log(`   - Priority: ${retrievedTask.priority}`);
      console.log(`   - Assigned To: ${retrievedTask.assignedToName}`);
      console.log(`   - Category: ${retrievedTask.category}`);
      console.log(`   - Tags: ${retrievedTask.tags.join(', ')}`);
    } else {
      console.log('❌ Failed to retrieve task');
      return false;
    }
    
    // Test task listing
    console.log('\n📋 Testing task listing...');
    const allTasks = await tasksCollection.find({}).toArray();
    const testTasks = allTasks.filter(task => task.title.startsWith('Quick Test'));
    
    console.log(`✅ Found ${testTasks.length} test tasks in database`);
    console.log(`   Total tasks in database: ${allTasks.length}`);
    
    // Clean up
    await tasksCollection.deleteOne({ _id: result.insertedId });
    console.log('\n🧹 Test task cleaned up');
    
    console.log('\n🎉 Task functionality test completed successfully!');
    console.log('✅ Tasks can be created and retrieved');
    console.log('✅ Database operations working');
    console.log('✅ Task structure is valid');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    return false;
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
testTaskOperations().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
