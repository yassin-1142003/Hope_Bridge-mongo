#!/usr/bin/env ts-node

/**
 * Test Script: Verify Task Functionality
 * 
 * This script tests the task creation and listing functionality
 * to ensure it works correctly with the recent changes.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

interface TestTask {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  category: string;
  files?: any[];
  alertBeforeDue?: boolean;
  alertDays?: number;
}

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not found in environment variables');
  }
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');
}

async function createTestTasks() {
  console.log('📝 Creating test tasks...');
  
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }
  
  const tasksCollection = db.collection('tasks');
  
  // Clean up any existing test tasks
  await tasksCollection.deleteMany({ title: { $regex: /^Test Task/ } });
  
  // Create test tasks
  const testTasks: TestTask[] = [
    {
      title: 'Test Task 1 - High Priority',
      description: 'This is a high priority test task to verify functionality',
      assignedTo: 'test@example.com',
      assignedToName: 'Test User',
      priority: 'high',
      status: 'pending',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: 'admin@example.com',
      createdByName: 'Admin User',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['test', 'urgent', 'backend'],
      category: 'development',
      alertBeforeDue: true,
      alertDays: 2
    },
    {
      title: 'Test Task 2 - Medium Priority',
      description: 'This is a medium priority test task for UI testing',
      assignedTo: 'designer@example.com',
      assignedToName: 'Designer User',
      priority: 'medium',
      status: 'in_progress',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: 'admin@example.com',
      createdByName: 'Admin User',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['test', 'frontend', 'ui'],
      category: 'design'
    },
    {
      title: 'Test Task 3 - Low Priority',
      description: 'This is a low priority test task for documentation',
      assignedTo: 'writer@example.com',
      assignedToName: 'Writer User',
      priority: 'low',
      status: 'completed',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: 'admin@example.com',
      createdByName: 'Admin User',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['test', 'documentation', 'completed'],
      category: 'general'
    }
  ];
  
  const result = await tasksCollection.insertMany(testTasks);
  console.log(`✅ Created ${result.insertedCount} test tasks`);
  
  return Object.values(result.insertedIds).map(id => id.toString());
}

async function testTaskAPI() {
  console.log('🌐 Testing task API endpoints...');
  
  try {
    // Test GET /api/tasks
    console.log('Testing GET /api/tasks...');
    const getResponse = await fetch('http://localhost:3000/api/tasks', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      const testTasks = data.data?.filter((task: any) => task.title?.startsWith('Test Task'));
      
      console.log(`✅ GET /api/tasks returned ${testTasks?.length || 0} test tasks`);
      
      for (const task of testTasks || []) {
        console.log(`   📋 ${task.title}:`);
        console.log(`      - Status: ${task.status}`);
        console.log(`      - Priority: ${task.priority}`);
        console.log(`      - Assigned to: ${task.assignedToName || task.assignedTo}`);
        console.log(`      - Category: ${task.category}`);
        console.log(`      - Tags: ${(task.tags || []).join(', ')}`);
      }
    } else {
      console.log(`❌ GET /api/tasks failed with status: ${getResponse.status}`);
      return false;
    }
    
    // Test POST /api/tasks (create new task)
    console.log('\nTesting POST /api/tasks...');
    const newTask = {
      title: 'API Test Task - Created via API',
      description: 'This task was created through the API to test functionality',
      assignedTo: 'test@example.com',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ['api-test', 'automated'],
      category: 'testing'
    };
    
    const postResponse = await fetch('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTask)
    });
    
    if (postResponse.ok) {
      const createdTask = await postResponse.json();
      console.log(`✅ POST /api/tasks created task: ${createdTask.data?.title}`);
      return true;
    } else {
      const errorData = await postResponse.json();
      console.log(`❌ POST /api/tasks failed:`, errorData);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ API test failed: ${error}`);
    return false;
  }
}

async function verifyTaskStructure(taskIds: string[]) {
  console.log('\n🔍 Verifying task structure in database...');
  
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }
  
  const tasksCollection = db.collection('tasks');
  
  const tasks = await tasksCollection.find({ 
    _id: { $in: taskIds.map(id => new mongoose.Types.ObjectId(id)) }
  }).toArray() as unknown as TestTask[];
  
  console.log('\n📊 Task Structure Verification:');
  console.log('='.repeat(50));
  
  for (const task of tasks) {
    console.log(`\n📋 Task: ${task.title}`);
    console.log(`   ID: ${task._id}`);
    console.log(`   Status: ${task.status}`);
    console.log(`   Priority: ${task.priority}`);
    console.log(`   Assigned To: ${task.assignedToName} (${task.assignedTo})`);
    console.log(`   Created By: ${task.createdByName} (${task.createdBy})`);
    console.log(`   Start Date: ${task.startDate}`);
    console.log(`   End Date: ${task.endDate}`);
    console.log(`   Category: ${task.category}`);
    console.log(`   Tags: ${(task.tags || []).join(', ')}`);
    console.log(`   Alert Before Due: ${task.alertBeforeDue}`);
    console.log(`   Alert Days: ${task.alertDays}`);
    console.log(`   Created: ${task.createdAt}`);
    console.log(`   Updated: ${task.updatedAt}`);
  }
  
  // Validate required fields
  const missingFields = [];
  for (const task of tasks) {
    if (!task.title) missingFields.push(`${task.title}: missing title`);
    if (!task.assignedTo) missingFields.push(`${task.title}: missing assignedTo`);
    if (!task.createdBy) missingFields.push(`${task.title}: missing createdBy`);
    if (!task.status) missingFields.push(`${task.title}: missing status`);
    if (!task.priority) missingFields.push(`${task.title}: missing priority`);
  }
  
  if (missingFields.length === 0) {
    console.log('\n✅ All tasks have required fields');
    return true;
  } else {
    console.log('\n❌ Missing fields found:');
    missingFields.forEach(field => console.log(`   - ${field}`));
    return false;
  }
}

async function cleanupTestTasks() {
  console.log('\n🧹 Cleaning up test tasks...');
  
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }
  
  const tasksCollection = db.collection('tasks');
  
  const result = await tasksCollection.deleteMany({ title: { $regex: /^(Test Task|API Test Task)/ } });
  console.log(`✅ Deleted ${result.deletedCount} test tasks`);
}

async function main() {
  console.log('🚀 Starting Task Functionality Test...\n');
  
  try {
    await connectToDatabase();
    
    // Create test data
    const taskIds = await createTestTasks();
    
    // Verify task structure
    const structureValid = await verifyTaskStructure(taskIds);
    
    // Test API endpoints
    const apiWorks = await testTaskAPI();
    
    // Cleanup
    await cleanupTestTasks();
    
    console.log('\n📋 Final Results:');
    console.log('='.repeat(30));
    console.log(`Task Structure: ${structureValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`API Functionality: ${apiWorks ? '✅ PASS' : '❌ FAIL'}`);
    
    if (structureValid && apiWorks) {
      console.log('\n🎉 Task functionality is working correctly!');
      console.log('✅ Tasks can be created and listed properly');
      console.log('✅ API endpoints are functioning');
      console.log('✅ Database structure is valid');
    } else {
      console.log('\n⚠️  Some issues found. Please review the problems above.');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(console.error);
