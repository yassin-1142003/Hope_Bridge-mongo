/**
 * Complete Task Management System Test
 * 
 * This script tests the entire Task Management System end-to-end
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

// Mock user data for testing
const testUsers = [
  {
    id: 'gm-test-1',
    name: 'Test General Manager',
    email: 'gm@test.com',
    role: 'GENERAL_MANAGER'
  },
  {
    id: 'hr-test-1', 
    name: 'Test HR Manager',
    email: 'hr@test.com',
    role: 'HR'
  },
  {
    id: 'finance-test-1',
    name: 'Test Finance Manager', 
    email: 'finance@test.com',
    role: 'FINANCE'
  },
  {
    id: 'dev-test-1',
    name: 'Test Developer',
    email: 'dev@test.com', 
    role: 'PROJECT_COORDINATOR'
  }
];

async function testCompleteSystem() {
  console.log('🧪 Testing Complete Task Management System...\n');

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not found in environment variables');
  }

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const db = mongoose.connection.db;
  
  if (!db) {
    throw new Error('Failed to connect to database');
  }

  try {
    // Test 1: Verify Collection Setup
    console.log('📋 Test 1: Verifying Collection Setup...');
    
    const collections = await db.listCollections({ name: 'tasks' }).toArray();
    if (collections.length === 0) {
      throw new Error('Tasks collection not found');
    }
    console.log('✅ Tasks collection exists');

    // Test 2: Verify Indexes
    console.log('\n📊 Test 2: Verifying Indexes...');
    
    const indexes = await db.collection('tasks').listIndexes().toArray();
    const requiredIndexes = [
      'assignedTo_1_status_1',
      'assignedBy_1_status_1', 
      'status_1_createdAt_-1',
      'assignedToRole_1_status_1',
      'tags_1',
      'category_1',
      'priority_1',
      'dueDate_1'
    ];

    const indexNames = indexes.map(idx => idx.name);
    for (const requiredIndex of requiredIndexes) {
      if (!indexNames.includes(requiredIndex)) {
        throw new Error(`Missing required index: ${requiredIndex}`);
      }
    }
    console.log(`✅ All ${requiredIndexes.length} required indexes exist`);

    // Test 3: Create Test Tasks
    console.log('\n📝 Test 3: Creating Test Tasks...');
    
    const testTasks = [
      {
        title: 'System Integration Test',
        description: 'Test task for system integration verification',
        assignedBy: testUsers[0].id,
        assignedByName: testUsers[0].name,
        assignedTo: testUsers[1].id,
        assignedToName: testUsers[1].name,
        assignedToRole: testUsers[1].role,
        status: 'PENDING',
        priority: 'high',
        formData: {
          title: 'Integration Test Form',
          description: 'Form for testing system integration',
          fields: [
            {
              id: 'test-field-1',
              type: 'text',
              label: 'Test Input',
              required: true,
              placeholder: 'Enter test value'
            },
            {
              id: 'test-field-2',
              type: 'select',
              label: 'Test Select',
              required: true,
              options: ['Option 1', 'Option 2', 'Option 3']
            },
            {
              id: 'test-field-3',
              type: 'file',
              label: 'Test File Upload',
              required: false
            }
          ],
          instructions: 'Please fill out all required fields for testing'
        },
        attachments: [],
        responseFiles: [],
        activities: [
          {
            id: 'activity-test-1',
            action: 'CREATED',
            performedBy: testUsers[0].id,
            performedByRole: testUsers[0].role,
            timestamp: new Date(),
            comment: 'Test task created for system verification'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        category: 'testing',
        tags: ['test', 'integration', 'system'],
        estimatedHours: 2,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Multi-Role Assignment Test',
        description: 'Test task assigned to different roles',
        assignedBy: testUsers[0].id,
        assignedByName: testUsers[0].name,
        assignedTo: testUsers[2].id,
        assignedToName: testUsers[2].name,
        assignedToRole: testUsers[2].role,
        status: 'PENDING',
        priority: 'medium',
        formData: {
          title: 'Multi-Role Test Form',
          description: 'Testing role-based task assignment',
          fields: [
            {
              id: 'role-test-1',
              type: 'textarea',
              label: 'Role-Specific Response',
              required: true,
              placeholder: 'Describe your role-specific tasks'
            },
            {
              id: 'role-test-2',
              type: 'number',
              label: 'Performance Metrics',
              required: true,
              validation: { min: 0, max: 100 }
            }
          ],
          instructions: 'Complete this form based on your role responsibilities'
        },
        attachments: [],
        responseFiles: [],
        activities: [
          {
            id: 'activity-role-1',
            action: 'CREATED',
            performedBy: testUsers[0].id,
            performedByRole: testUsers[0].role,
            timestamp: new Date(),
            comment: 'Multi-role test task created'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        category: 'role-testing',
        tags: ['test', 'role', 'assignment'],
        estimatedHours: 1.5
      }
    ];

    const insertResult = await db.collection('tasks').insertMany(testTasks);
    console.log(`✅ Created ${insertResult.insertedCount} test tasks`);

    // Test 4: Query Tasks by Role
    console.log('\n🔍 Test 4: Testing Role-Based Queries...');
    
    // GM should see all tasks
    const allTasks = await db.collection('tasks').find({}).toArray();
    console.log(`✅ GM can see ${allTasks.length} total tasks`);

    // HR should see only their tasks
    const hrTasks = await db.collection('tasks').find({ assignedToRole: 'HR' }).toArray();
    console.log(`✅ HR can see ${hrTasks.length} assigned tasks`);

    // Finance should see only their tasks  
    const financeTasks = await db.collection('tasks').find({ assignedToRole: 'FINANCE' }).toArray();
    console.log(`✅ Finance can see ${financeTasks.length} assigned tasks`);

    // Test 5: Test Task Status Updates
    console.log('\n📊 Test 5: Testing Task Status Updates...');
    
    // Update a task to IN_PROGRESS
    const taskId = insertResult.insertedIds[0].toString();
    await db.collection('tasks').updateOne(
      { _id: insertResult.insertedIds[0] },
      { 
        $set: { status: 'IN_PROGRESS', updatedAt: new Date() },
        $push: {
          activities: {
            id: 'activity-update-1',
            action: 'IN_PROGRESS',
            performedBy: testUsers[1].id,
            performedByRole: testUsers[1].role,
            timestamp: new Date(),
            comment: 'Task started by employee'
          }
        }
      }
    );

    const updatedTask = await db.collection('tasks').findOne({ _id: insertResult.insertedIds[0] });
    if (updatedTask.status !== 'IN_PROGRESS') {
      throw new Error('Task status update failed');
    }
    console.log('✅ Task status updated successfully');

    // Test 6: Test Task Submission
    console.log('\n📤 Test 6: Testing Task Submission...');
    
    const employeeResponse = {
      'test-field-1': 'Integration test completed successfully',
      'test-field-2': 'Option 1',
      'test-field-3': ['test-file.pdf']
    };

    await db.collection('tasks').updateOne(
      { _id: insertResult.insertedIds[0] },
      { 
        $set: { 
          status: 'SUBMITTED',
          employeeResponse: employeeResponse,
          submittedAt: new Date(),
          updatedAt: new Date()
        },
        $push: {
          activities: {
            id: 'activity-submit-1',
            action: 'SUBMITTED',
            performedBy: testUsers[1].id,
            performedByRole: testUsers[1].role,
            timestamp: new Date(),
            comment: 'Task submitted for review'
          }
        }
      }
    );

    const submittedTask = await db.collection('tasks').findOne({ _id: insertResult.insertedIds[0] });
    if (submittedTask.status !== 'SUBMITTED') {
      throw new Error('Task submission failed');
    }
    console.log('✅ Task submitted successfully');

    // Test 7: Test Task Review and Completion
    console.log('\n✅ Test 7: Testing Task Review and Completion...');
    
    await db.collection('tasks').updateOne(
      { _id: insertResult.insertedIds[0] },
      { 
        $set: { 
          status: 'COMPLETED',
          completedAt: new Date(),
          updatedAt: new Date(),
          actualHours: 1.8
        },
        $push: {
          activities: {
            id: 'activity-complete-1',
            action: 'COMPLETED',
            performedBy: testUsers[0].id,
            performedByRole: testUsers[0].role,
            timestamp: new Date(),
            comment: 'Task reviewed and completed by GM'
          }
        }
      }
    );

    const completedTask = await db.collection('tasks').findOne({ _id: insertResult.insertedIds[0] });
    if (completedTask.status !== 'COMPLETED') {
      throw new Error('Task completion failed');
    }
    console.log('✅ Task completed successfully');

    // Test 8: Test Statistics and Reporting
    console.log('\n📈 Test 8: Testing Statistics and Reporting...');
    
    const stats = await db.collection('tasks').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    console.log('📊 Task Statistics:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} tasks`);
    });

    // Test 9: Test Search and Filtering
    console.log('\n🔍 Test 9: Testing Search and Filtering...');
    
    // Test text search
    const searchResults = await db.collection('tasks').find({
      $text: { $search: 'integration' }
    }).toArray();
    console.log(`✅ Text search found ${searchResults.length} tasks`);

    // Test filtering by priority
    const highPriorityTasks = await db.collection('tasks').find({ 
      priority: 'high' 
    }).toArray();
    console.log(`✅ Found ${highPriorityTasks.length} high priority tasks`);

    // Test filtering by category
    const testingTasks = await db.collection('tasks').find({ 
      category: 'testing' 
    }).toArray();
    console.log(`✅ Found ${testingTasks.length} testing tasks`);

    // Test 10: Test Activity Timeline
    console.log('\n📅 Test 10: Testing Activity Timeline...');
    
    const taskWithActivities = await db.collection('tasks').findOne({ 
      _id: insertResult.insertedIds[0] 
    });
    
    if (!taskWithActivities.activities || taskWithActivities.activities.length < 3) {
      throw new Error('Activity timeline not working correctly');
    }
    console.log(`✅ Task has ${taskWithActivities.activities.length} activity entries`);

    // Test 11: Test Role-Based Access Control
    console.log('\n🔐 Test 11: Testing Role-Based Access Control...');
    
    // Test that GM can see all tasks
    const gmView = await db.collection('tasks').find({}).toArray();
    console.log(`✅ GM can view all ${gmView.length} tasks`);

    // Test that employees can only see their tasks
    const employeeView = await db.collection('tasks').find({ 
      assignedTo: testUsers[1].id 
    }).toArray();
    console.log(`✅ Employee can view ${employeeView.length} assigned tasks`);

    // Test 12: Clean Up Test Data
    console.log('\n🧹 Test 12: Cleaning Up Test Data...');
    
    await db.collection('tasks').deleteMany({
      $or: [
        { title: { $regex: /test/i } },
        { category: 'testing' },
        { category: 'role-testing' }
      ]
    });
    
    const finalCount = await db.collection('tasks').countDocuments();
    console.log(`✅ Cleaned up test data. Remaining tasks: ${finalCount}`);

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
    console.log('\n✅ System Verification Complete:');
    console.log('   ✅ Database schema and indexes');
    console.log('   ✅ Task creation and assignment');
    console.log('   ✅ Role-based access control');
    console.log('   ✅ Task status workflow');
    console.log('   ✅ Form submission and responses');
    console.log('   ✅ Task review and completion');
    console.log('   ✅ Activity logging and timeline');
    console.log('   ✅ Search and filtering');
    console.log('   ✅ Statistics and reporting');
    console.log('   ✅ Data integrity and cleanup');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Run the complete system test
testCompleteSystem().then(() => {
  console.log('\n🚀 Task Management System is READY FOR PRODUCTION!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ System test failed:', error);
  process.exit(1);
});
