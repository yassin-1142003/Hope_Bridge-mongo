// scripts/test-task-tracking.js - Test script for the task tracking system
const { MongoClient } = require('mongodb');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function testTaskTracking() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    
    console.log('🧪 Testing task tracking system...');
    
    // Test 1: Insert sample task activities
    console.log('\n📝 Test 1: Inserting sample task activities...');
    const taskActivities = db.collection('task_activities');
    
    const sampleActivities = [
      {
        userId: 'admin-001',
        userRole: 'ADMIN',
        userName: 'Admin User',
        userEmail: 'admin@hopebridge.com',
        action: 'create_task',
        entityType: 'task',
        entityId: 'task-001',
        entityName: 'Test Task 1',
        operation: 'CREATE',
        description: 'Admin created a new task',
        dataSent: { title: 'Test Task', description: 'This is a test task' },
        apiEndpoint: '/api/tasks',
        httpMethod: 'POST',
        statusCode: 201,
        responseTime: 245,
        success: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        department: 'Management',
        metadata: {
          previousValues: null,
          newValues: { status: 'pending' }
        },
        createdAt: new Date()
      },
      {
        userId: 'coordinator-001',
        userRole: 'PROJECT_COORDINATOR',
        userName: 'Project Coordinator',
        userEmail: 'coordinator@hopebridge.com',
        action: 'update_project',
        entityType: 'project',
        entityId: 'project-001',
        entityName: 'School Renovation',
        operation: 'UPDATE',
        description: 'Coordinator updated project status',
        dataSent: { status: 'active', progress: 75 },
        dataReceived: { status: 'planning', progress: 45 },
        apiEndpoint: '/api/projects/project-001',
        httpMethod: 'PATCH',
        statusCode: 200,
        responseTime: 189,
        success: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        department: 'Projects',
        metadata: {
          previousValues: { status: 'planning' },
          newValues: { status: 'active' }
        },
        createdAt: new Date()
      },
      {
        userId: 'field-officer-001',
        userRole: 'FIELD_OFFICER',
        userName: 'Field Officer',
        userEmail: 'field@hopebridge.com',
        action: 'send_notification',
        entityType: 'notification',
        entityId: 'notif-bulk-001',
        entityName: 'Task Assignment Notifications',
        operation: 'SEND',
        description: 'Field officer sent assignment notifications',
        dataSent: {
          message: 'New tasks assigned',
          recipients: ['volunteer-001', 'volunteer-002'],
          type: 'task_assigned'
        },
        apiEndpoint: '/api/notifications/send',
        httpMethod: 'POST',
        statusCode: 200,
        responseTime: 423,
        success: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        department: 'Operations',
        metadata: {
          affectedUsers: ['volunteer-001', 'volunteer-002'],
          notificationsSent: 2
        },
        createdAt: new Date()
      },
      {
        userId: 'hr-001',
        userRole: 'HR',
        userName: 'HR Manager',
        userEmail: 'hr@hopebridge.com',
        action: 'read_users',
        entityType: 'user',
        entityId: 'users-list',
        entityName: 'Users List',
        operation: 'READ',
        description: 'HR accessed user list',
        apiEndpoint: '/api/users',
        httpMethod: 'GET',
        statusCode: 200,
        responseTime: 156,
        success: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        department: 'HR',
        createdAt: new Date()
      },
      {
        userId: 'volunteer-001',
        userRole: 'VOLUNTEER',
        userName: 'Volunteer User',
        userEmail: 'volunteer@hopebridge.com',
        action: 'update_task_failed',
        entityType: 'task',
        entityId: 'task-002',
        entityName: 'Community Outreach',
        operation: 'UPDATE',
        description: 'Volunteer failed to update task',
        dataSent: { status: 'completed' },
        apiEndpoint: '/api/tasks/task-002',
        httpMethod: 'PATCH',
        statusCode: 403,
        responseTime: 89,
        success: false,
        errorMessage: 'Permission denied: Cannot mark task as completed',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        department: 'Volunteer',
        createdAt: new Date()
      }
    ];
    
    const insertResult = await taskActivities.insertMany(sampleActivities);
    console.log(`✅ Inserted ${insertResult.insertedCount} task activities`);
    
    // Test 2: Query activities by role
    console.log('\n🔍 Test 2: Querying activities by role...');
    const adminActivities = await taskActivities
      .find({ userRole: 'ADMIN' })
      .sort({ createdAt: -1 })
      .toArray();
    console.log(`✅ Found ${adminActivities.length} ADMIN activities`);
    
    // Test 3: Query activities by entity type
    console.log('\n🔍 Test 3: Querying activities by entity type...');
    const taskActivitiesOnly = await taskActivities
      .find({ entityType: 'task' })
      .sort({ createdAt: -1 })
      .toArray();
    console.log(`✅ Found ${taskActivitiesOnly.length} task-related activities`);
    
    // Test 4: Query failed activities
    console.log('\n❌ Test 4: Querying failed activities...');
    const failedActivities = await taskActivities
      .find({ success: false })
      .sort({ createdAt: -1 })
      .toArray();
    console.log(`✅ Found ${failedActivities.length} failed activities`);
    
    // Test 5: Insert role metrics
    console.log('\n📊 Test 5: Inserting role metrics...');
    const roleMetrics = db.collection('role_metrics');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sampleMetrics = [
      {
        role: 'ADMIN',
        date: today,
        totalActions: 15,
        actionsByType: {
          'create_task': 5,
          'update_project': 3,
          'read_users': 7
        },
        actionsByEntity: {
          'task': 5,
          'project': 3,
          'user': 7
        },
        successfulActions: 14,
        failedActions: 1,
        averageResponseTime: 198,
        mostActiveUsers: [
          {
            userId: 'admin-001',
            userName: 'Admin User',
            actionCount: 15
          }
        ],
        peakHours: [
          { hour: 9, actionCount: 5 },
          { hour: 14, actionCount: 7 },
          { hour: 16, actionCount: 3 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role: 'PROJECT_COORDINATOR',
        date: today,
        totalActions: 23,
        actionsByType: {
          'update_project': 8,
          'create_task': 6,
          'send_notification': 5,
          'read_tasks': 4
        },
        actionsByEntity: {
          'project': 8,
          'task': 10,
          'notification': 5
        },
        successfulActions: 22,
        failedActions: 1,
        averageResponseTime: 245,
        mostActiveUsers: [
          {
            userId: 'coordinator-001',
            userName: 'Project Coordinator',
            actionCount: 23
          }
        ],
        peakHours: [
          { hour: 10, actionCount: 8 },
          { hour: 15, actionCount: 10 },
          { hour: 17, actionCount: 5 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const metricsResult = await roleMetrics.insertMany(sampleMetrics);
    console.log(`✅ Inserted ${metricsResult.insertedCount} role metrics`);
    
    // Test 6: Aggregate metrics by role
    console.log('\n📈 Test 6: Aggregating metrics by role...');
    const aggregatedMetrics = await roleMetrics
      .aggregate([
        { $match: { date: today } },
        { $group: { 
          _id: '$role',
          totalActions: { $sum: '$totalActions' },
          avgResponseTime: { $avg: '$averageResponseTime' },
          successRate: { 
            $avg: { 
              $divide: ['$successfulActions', '$totalActions'] 
            } 
          }
        }},
        { $sort: { totalActions: -1 } }
      ])
      .toArray();
    
    console.log('✅ Role performance summary:');
    aggregatedMetrics.forEach(metric => {
      console.log(`   ${metric._id}: ${metric.totalActions} actions, ${metric.avgResponseTime.toFixed(0)}ms avg, ${(metric.successRate * 100).toFixed(1)}% success`);
    });
    
    // Test 7: Performance analysis
    console.log('\n⚡ Test 7: Performance analysis...');
    const performanceStats = await taskActivities
      .aggregate([
        {
          $group: {
            _id: '$userRole',
            avgResponseTime: { $avg: '$responseTime' },
            maxResponseTime: { $max: '$responseTime' },
            minResponseTime: { $min: '$responseTime' },
            totalRequests: { $sum: 1 },
            successRate: {
              $avg: { $cond: ['$success', 1, 0] }
            }
          }
        },
        { $sort: { avgResponseTime: 1 } }
      ])
      .toArray();
    
    console.log('✅ Performance by role (fastest first):');
    performanceStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.avgResponseTime.toFixed(0)}ms avg, ${stat.maxResponseTime}ms max, ${(stat.successRate * 100).toFixed(1)}% success`);
    });
    
    // Test 8: Error analysis
    console.log('\n🚨 Test 8: Error analysis...');
    const errorAnalysis = await taskActivities
      .aggregate([
        { $match: { success: false } },
        {
          $group: {
            _id: { role: '$userRole', error: '$errorMessage' },
            count: { $sum: 1 },
            endpoints: { $addToSet: '$apiEndpoint' }
          }
        },
        { $sort: { count: -1 } }
      ])
      .toArray();
    
    console.log('✅ Error patterns:');
    errorAnalysis.forEach(error => {
      console.log(`   ${error._id.role}: ${error.count}x - ${error._id.error}`);
    });
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Task activities: ${await taskActivities.countDocuments()}`);
    console.log(`   - Role metrics: ${await roleMetrics.countDocuments()}`);
    console.log(`   - Failed activities: ${await taskActivities.countDocuments({ success: false })}`);
    console.log(`   - Average response time: ${(await taskActivities.aggregate([{ $group: { _id: null, avgTime: { $avg: '$responseTime' } } }]).next())?.avgTime?.toFixed(0)}ms`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testTaskTracking().catch(console.error);
}

module.exports = { testTaskTracking };
