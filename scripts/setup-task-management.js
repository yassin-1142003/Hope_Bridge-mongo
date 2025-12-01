/**
 * Task Management System Setup Script (JavaScript version)
 * 
 * This script sets up the MongoDB collections and indexes for the task management system
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function setupTaskManagement() {
  console.log('🚀 Setting up Task Management System...\n');

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
    // Create tasks collection with schema validation
    console.log('📋 Creating tasks collection...');

    const taskSchema = {
      $jsonSchema: {
        bsonType: 'object',
        required: ['title', 'description', 'assignedBy', 'assignedByName', 'assignedTo', 'assignedToName', 'assignedToRole', 'status', 'priority', 'formData'],
        properties: {
          title: {
            bsonType: 'string',
            description: 'Task title',
            minLength: 1,
            maxLength: 200
          },
          description: {
            bsonType: 'string',
            description: 'Task description',
            minLength: 1,
            maxLength: 2000
          },
          assignedBy: {
            bsonType: 'string',
            description: 'ID of the user who assigned the task'
          },
          assignedByName: {
            bsonType: 'string',
            description: 'Name of the user who assigned the task'
          },
          assignedTo: {
            bsonType: 'string',
            description: 'ID of the user the task is assigned to'
          },
          assignedToName: {
            bsonType: 'string',
            description: 'Name of the user the task is assigned to'
          },
          assignedToRole: {
            bsonType: 'string',
            description: 'Role of the user the task is assigned to',
            enum: ['SUPER_ADMIN', 'ADMIN', 'GENERAL_MANAGER', 'PROGRAM_MANAGER', 'PROJECT_COORDINATOR', 'HR', 'FINANCE', 'PROCUREMENT', 'STOREKEEPER', 'ME_OFFICER', 'FIELD_OFFICER', 'ACCOUNTANT', 'USER']
          },
          status: {
            bsonType: 'string',
            description: 'Current status of the task',
            enum: ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'CANCELLED']
          },
          priority: {
            bsonType: 'string',
            description: 'Priority level of the task',
            enum: ['low', 'medium', 'high', 'urgent']
          },
          formData: {
            bsonType: 'object',
            required: ['title', 'description', 'fields'],
            properties: {
              title: { bsonType: 'string', minLength: 1 },
              description: { bsonType: 'string', minLength: 1 },
              fields: {
                bsonType: 'array',
                items: {
                  bsonType: 'object',
                  required: ['id', 'type', 'label'],
                  properties: {
                    id: { bsonType: 'string' },
                    type: { bsonType: 'string', enum: ['text', 'textarea', 'number', 'email', 'date', 'select', 'checkbox', 'radio', 'file'] },
                    label: { bsonType: 'string' },
                    required: { bsonType: 'bool' }
                  }
                }
              }
            }
          },
          employeeResponse: {
            bsonType: 'object',
            description: 'Employee submitted response data'
          },
          attachments: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              required: ['id', 'filename', 'url', 'uploadedBy'],
              properties: {
                id: { bsonType: 'string' },
                filename: { bsonType: 'string' },
                url: { bsonType: 'string' },
                uploadedBy: { bsonType: 'string' }
              }
            }
          },
          responseFiles: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              required: ['id', 'filename', 'url', 'uploadedBy'],
              properties: {
                id: { bsonType: 'string' },
                filename: { bsonType: 'string' },
                url: { bsonType: 'string' },
                uploadedBy: { bsonType: 'string' }
              }
            }
          },
          activities: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              required: ['id', 'action', 'performedBy', 'performedByRole', 'timestamp'],
              properties: {
                id: { bsonType: 'string' },
                action: { bsonType: 'string', enum: ['CREATED', 'ASSIGNED', 'VIEWED', 'IN_PROGRESS', 'SUBMITTED', 'REVIEWED', 'COMPLETED', 'CANCELLED'] },
                performedBy: { bsonType: 'string' },
                performedByRole: { bsonType: 'string' },
                timestamp: { bsonType: 'date' }
              }
            }
          },
          category: { bsonType: 'string' },
          tags: {
            bsonType: 'array',
            items: { bsonType: 'string' }
          },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' },
          submittedAt: { bsonType: 'date' },
          completedAt: { bsonType: 'date' },
          dueDate: { bsonType: 'date' },
          estimatedHours: { bsonType: 'number' },
          actualHours: { bsonType: 'number' }
        }
      }
    };

    // Drop existing collection if it exists
    const existingCollections = await db.listCollections({ name: 'tasks' }).toArray();
    if (existingCollections.length > 0) {
      await db.collection('tasks').drop();
      console.log('🗑️  Dropped existing tasks collection');
    }

    // Create collection with schema validation
    await db.createCollection('tasks', {
      validator: taskSchema
    });

    console.log('✅ Tasks collection created with schema validation');

    // Create indexes for performance
    console.log('📊 Creating indexes...');

    await db.collection('tasks').createIndex({ assignedTo: 1, status: 1 });
    await db.collection('tasks').createIndex({ assignedBy: 1, status: 1 });
    await db.collection('tasks').createIndex({ status: 1, createdAt: -1 });
    await db.collection('tasks').createIndex({ assignedToRole: 1, status: 1 });
    await db.collection('tasks').createIndex({ tags: 1 });
    await db.collection('tasks').createIndex({ category: 1 });
    await db.collection('tasks').createIndex({ priority: 1 });
    await db.collection('tasks').createIndex({ dueDate: 1 });
    await db.collection('tasks').createIndex({ 
      title: 'text', 
      description: 'text', 
      assignedToName: 'text',
      tags: 'text'
    });

    console.log('✅ Indexes created successfully');

    // Create sample data for testing
    console.log('📝 Creating sample tasks...');

    const sampleTasks = [
      {
        title: 'Complete Project Documentation',
        description: 'Write comprehensive documentation for the new project management system',
        assignedBy: 'gm-id-1',
        assignedByName: 'General Manager',
        assignedTo: 'dev-id-1',
        assignedToName: 'John Developer',
        assignedToRole: 'PROJECT_COORDINATOR',
        status: 'PENDING',
        priority: 'high',
        formData: {
          title: 'Project Documentation Form',
          description: 'Please fill out the project documentation details',
          fields: [
            {
              id: 'field-1',
              type: 'textarea',
              label: 'Project Overview',
              required: true,
              placeholder: 'Provide a detailed overview of the project'
            },
            {
              id: 'field-2',
              type: 'date',
              label: 'Project Start Date',
              required: true
            },
            {
              id: 'field-3',
              type: 'select',
              label: 'Project Category',
              required: true,
              options: ['Development', 'Design', 'Marketing', 'Operations']
            }
          ],
          instructions: 'Please provide accurate and detailed information for each field.'
        },
        attachments: [],
        responseFiles: [],
        activities: [
          {
            id: 'activity-1',
            action: 'CREATED',
            performedBy: 'gm-id-1',
            performedByRole: 'GENERAL_MANAGER',
            timestamp: new Date(),
            comment: 'Task created and assigned to John Developer'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        category: 'development',
        tags: ['documentation', 'urgent', 'project'],
        estimatedHours: 8,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Monthly Financial Report',
        description: 'Prepare and submit the monthly financial report for review',
        assignedBy: 'gm-id-1',
        assignedByName: 'General Manager',
        assignedTo: 'finance-id-1',
        assignedToName: 'Sarah Finance',
        assignedToRole: 'FINANCE',
        status: 'IN_PROGRESS',
        priority: 'urgent',
        formData: {
          title: 'Financial Report Form',
          description: 'Monthly financial reporting template',
          fields: [
            {
              id: 'field-1',
              type: 'number',
              label: 'Total Revenue',
              required: true,
              validation: { min: 0 }
            },
            {
              id: 'field-2',
              type: 'number',
              label: 'Total Expenses',
              required: true,
              validation: { min: 0 }
            },
            {
              id: 'field-3',
              type: 'file',
              label: 'Detailed Financial Statement',
              required: true
            }
          ]
        },
        attachments: [
          {
            id: 'attachment-1',
            filename: 'template.xlsx',
            originalName: 'Financial Report Template.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            size: 1024000,
            url: '/files/template.xlsx',
            uploadedBy: 'gm-id-1',
            uploadedAt: new Date()
          }
        ],
        responseFiles: [],
        activities: [
          {
            id: 'activity-1',
            action: 'CREATED',
            performedBy: 'gm-id-1',
            performedByRole: 'GENERAL_MANAGER',
            timestamp: new Date(),
            comment: 'Task created and assigned to Sarah Finance'
          },
          {
            id: 'activity-2',
            action: 'IN_PROGRESS',
            performedBy: 'finance-id-1',
            performedByRole: 'FINANCE',
            timestamp: new Date(),
            comment: 'Started working on the financial report'
          }
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        category: 'finance',
        tags: ['finance', 'monthly', 'report'],
        estimatedHours: 4,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Employee Performance Review',
        description: 'Complete the quarterly employee performance review process',
        assignedBy: 'gm-id-1',
        assignedByName: 'General Manager',
        assignedTo: 'hr-id-1',
        assignedToName: 'Mike HR',
        assignedToRole: 'HR',
        status: 'SUBMITTED',
        priority: 'medium',
        formData: {
          title: 'Performance Review Form',
          description: 'Quarterly employee performance evaluation',
          fields: [
            {
              id: 'field-1',
              type: 'text',
              label: 'Employee Name',
              required: true
            },
            {
              id: 'field-2',
              type: 'radio',
              label: 'Overall Performance',
              required: true,
              options: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement']
            },
            {
              id: 'field-3',
              type: 'textarea',
              label: 'Comments',
              required: false,
              placeholder: 'Additional comments about performance'
            }
          ]
        },
        attachments: [],
        responseFiles: [
          {
            id: 'response-1',
            filename: 'performance-review.pdf',
            originalName: 'Q1 Performance Review.pdf',
            mimeType: 'application/pdf',
            size: 512000,
            url: '/files/performance-review.pdf',
            uploadedBy: 'hr-id-1',
            uploadedAt: new Date()
          }
        ],
        employeeResponse: {
          'field-1': 'John Doe',
          'field-2': 'Excellent',
          'field-3': 'Outstanding performance this quarter. Exceeded all targets.'
        },
        activities: [
          {
            id: 'activity-1',
            action: 'CREATED',
            performedBy: 'gm-id-1',
            performedByRole: 'GENERAL_MANAGER',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            comment: 'Task created and assigned to Mike HR'
          },
          {
            id: 'activity-2',
            action: 'SUBMITTED',
            performedBy: 'hr-id-1',
            performedByRole: 'HR',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            comment: 'Performance review completed and submitted'
          }
        ],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        category: 'hr',
        tags: ['performance', 'review', 'quarterly'],
        estimatedHours: 3,
        actualHours: 2.5
      }
    ];

    await db.collection('tasks').insertMany(sampleTasks);
    console.log(`✅ Created ${sampleTasks.length} sample tasks`);

    // Verify setup
    console.log('\n🔍 Verifying setup...');
    
    const taskCount = await db.collection('tasks').countDocuments();
    const indexes = await db.collection('tasks').listIndexes().toArray();
    
    console.log(`✅ Tasks collection has ${taskCount} documents`);
    console.log(`✅ Created ${indexes.length} indexes`);
    
    console.log('\n📊 Sample task statistics:');
    const stats = await db.collection('tasks').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} tasks`);
    });

    console.log('\n🎉 Task Management System setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Access the dashboard at /dashboard/task-management');
    console.log('   2. GM can create and manage tasks');
    console.log('   3. Employees can view and submit their assigned tasks');
    console.log('   4. All tasks are tracked with full activity logs');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Run the setup
setupTaskManagement().then(() => {
  console.log('\n✅ Setup completed successfully');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Setup failed:', error);
  process.exit(1);
});
