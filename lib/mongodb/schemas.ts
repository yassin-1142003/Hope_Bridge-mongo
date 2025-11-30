/**
 * MongoDB Schema Definitions for HopeBridge Application
 * 
 * This file defines the schema structure for all collections needed
 * for the dashboard and task management functionality.
 */

import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

// Define interfaces for TypeScript type safety
export interface User {
  _id?: ObjectId;
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PROJECT_COORDINATOR' | 'FIELD_OFFICER' | 'HR' | 'VOLUNTEER' | 'USER';
  isActive: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  phone?: string;
  department?: string;
}

export interface Task {
  _id?: ObjectId;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string; // User ID
  assignedToName?: string; // User name for display
  createdBy: string; // User ID
  createdByName: string; // User name for display
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date;
  endDate?: Date;
  dueDate?: Date;
  tags?: string[];
  files?: TaskFile[];
  estimatedHours?: number;
  actualHours?: number;
  progress?: number; // 0-100
  notes?: string;
  projectId?: string; // Project ID reference
  projectName?: string; // Project name for display
  alerts?: string[];
  alertBeforeDue?: boolean;
  alertDays?: number;
  department?: string;
  category?: string;
}

export interface TaskFile {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy?: string;
}

export interface Project {
  _id?: ObjectId;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: string; // User ID
  createdByName: string; // User name
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date;
  endDate?: Date;
  targetDate?: Date;
  budget?: number;
  actualCost?: number;
  progress?: number; // 0-100
  tags?: string[];
  teamMembers?: string[]; // User IDs
  files?: ProjectFile[];
  department?: string;
  location?: string;
  beneficiaries?: number;
  category: 'education' | 'healthcare' | 'infrastructure' | 'social_welfare' | 'emergency_relief' | 'environment';
  impact?: string;
  challenges?: string[];
}

export interface ProjectFile {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy?: string;
  category?: 'document' | 'image' | 'video' | 'report';
}

export interface Notification {
  _id?: ObjectId;
  userId: string; // User ID who should receive this notification
  title: string;
  message: string;
  type: 'new_projects_alert' | 'general' | 'deadline_reminder' | 'task_assigned' | 'project_update';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  actionUrl?: string;
  metadata?: {
    taskId?: string;
    projectId?: string;
    assignedBy?: string;
    [key: string]: any;
  };
}

export interface Activity {
  _id?: ObjectId;
  userId: string;
  action: string;
  entityType: 'task' | 'project' | 'user' | 'system';
  entityId: string;
  entityName: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Schema validation rules
export const SCHEMA_VALIDATION = {
  users: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'name', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'],
      properties: {
        id: { bsonType: 'string', description: 'Unique user identifier' },
        name: { bsonType: 'string', minLength: 1, maxLength: 100, description: 'User full name' },
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', description: 'User email address' },
        role: { 
          bsonType: 'string', 
          enum: ['ADMIN', 'PROJECT_COORDINATOR', 'FIELD_OFFICER', 'HR', 'VOLUNTEER', 'USER'],
          description: 'User role in the system'
        },
        isActive: { bsonType: 'bool', description: 'Whether user account is active' },
        avatar: { bsonType: 'string', description: 'URL to user avatar image' },
        createdAt: { bsonType: 'date', description: 'When user was created' },
        updatedAt: { bsonType: 'date', description: 'When user was last updated' },
        lastLogin: { bsonType: 'date', description: 'Last login timestamp' },
        phone: { bsonType: 'string', description: 'User phone number' },
        department: { bsonType: 'string', description: 'User department' }
      }
    }
  },
  
  tasks: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'description', 'status', 'priority', 'createdBy', 'createdByName', 'createdAt', 'updatedAt'],
      properties: {
        title: { bsonType: 'string', minLength: 1, maxLength: 200, description: 'Task title' },
        description: { bsonType: 'string', minLength: 1, description: 'Task description' },
        status: { 
          bsonType: 'string', 
          enum: ['pending', 'in_progress', 'completed', 'cancelled'],
          description: 'Current task status'
        },
        priority: { 
          bsonType: 'string', 
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Task priority level'
        },
        assignedTo: { bsonType: 'string', description: 'ID of user assigned to task' },
        assignedToName: { bsonType: 'string', description: 'Name of user assigned to task' },
        createdBy: { bsonType: 'string', description: 'ID of user who created task' },
        createdByName: { bsonType: 'string', description: 'Name of user who created task' },
        createdAt: { bsonType: 'date', description: 'When task was created' },
        updatedAt: { bsonType: 'date', description: 'When task was last updated' },
        startDate: { bsonType: 'date', description: 'Task start date' },
        endDate: { bsonType: 'date', description: 'Task end date' },
        dueDate: { bsonType: 'date', description: 'Task due date' },
        tags: { 
          bsonType: 'array', 
          items: { bsonType: 'string' },
          description: 'Task tags for categorization'
        },
        files: { 
          bsonType: 'array', 
          items: { bsonType: 'object' },
          description: 'Files attached to task'
        },
        estimatedHours: { bsonType: 'number', minimum: 0, description: 'Estimated hours to complete' },
        actualHours: { bsonType: 'number', minimum: 0, description: 'Actual hours spent' },
        progress: { bsonType: 'number', minimum: 0, maximum: 100, description: 'Task completion percentage' },
        notes: { bsonType: 'string', description: 'Additional notes about task' },
        projectId: { bsonType: 'string', description: 'ID of related project' },
        projectName: { bsonType: 'string', description: 'Name of related project' },
        alerts: { 
          bsonType: 'array', 
          items: { bsonType: 'string' },
          description: 'Task alerts and notifications'
        },
        alertBeforeDue: { bsonType: 'bool', description: 'Whether to alert before due date' },
        alertDays: { bsonType: 'number', minimum: 1, description: 'Days before due to alert' },
        department: { bsonType: 'string', description: 'Task department' },
        category: { bsonType: 'string', description: 'Task category' }
      }
    }
  },

  projects: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'description', 'status', 'priority', 'createdBy', 'createdByName', 'createdAt', 'updatedAt', 'category'],
      properties: {
        title: { bsonType: 'string', minLength: 1, maxLength: 200, description: 'Project title' },
        description: { bsonType: 'string', minLength: 1, description: 'Project description' },
        status: { 
          bsonType: 'string', 
          enum: ['planning', 'active', 'completed', 'cancelled', 'on_hold'],
          description: 'Current project status'
        },
        priority: { 
          bsonType: 'string', 
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Project priority level'
        },
        createdBy: { bsonType: 'string', description: 'ID of user who created project' },
        createdByName: { bsonType: 'string', description: 'Name of user who created project' },
        createdAt: { bsonType: 'date', description: 'When project was created' },
        updatedAt: { bsonType: 'date', description: 'When project was last updated' },
        startDate: { bsonType: 'date', description: 'Project start date' },
        endDate: { bsonType: 'date', description: 'Project end date' },
        targetDate: { bsonType: 'date', description: 'Project target completion date' },
        budget: { bsonType: 'number', minimum: 0, description: 'Project budget' },
        actualCost: { bsonType: 'number', minimum: 0, description: 'Actual project cost' },
        progress: { bsonType: 'number', minimum: 0, maximum: 100, description: 'Project completion percentage' },
        tags: { 
          bsonType: 'array', 
          items: { bsonType: 'string' },
          description: 'Project tags for categorization'
        },
        teamMembers: { 
          bsonType: 'array', 
          items: { bsonType: 'string' },
          description: 'IDs of team members'
        },
        files: { 
          bsonType: 'array', 
          items: { bsonType: 'object' },
          description: 'Files attached to project'
        },
        department: { bsonType: 'string', description: 'Project department' },
        location: { bsonType: 'string', description: 'Project location' },
        beneficiaries: { bsonType: 'number', minimum: 0, description: 'Number of beneficiaries' },
        category: { 
          bsonType: 'string', 
          enum: ['education', 'healthcare', 'infrastructure', 'social_welfare', 'emergency_relief', 'environment'],
          description: 'Project category'
        },
        impact: { bsonType: 'string', description: 'Project impact description' },
        challenges: { 
          bsonType: 'array', 
          items: { bsonType: 'string' },
          description: 'Project challenges'
        }
      }
    }
  },

  notifications: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'title', 'message', 'type', 'priority', 'isRead', 'createdAt'],
      properties: {
        userId: { bsonType: 'string', description: 'ID of user to notify' },
        title: { bsonType: 'string', minLength: 1, maxLength: 200, description: 'Notification title' },
        message: { bsonType: 'string', minLength: 1, description: 'Notification message' },
        type: { 
          bsonType: 'string', 
          enum: ['new_projects_alert', 'general', 'deadline_reminder', 'task_assigned', 'project_update'],
          description: 'Notification type'
        },
        priority: { 
          bsonType: 'string', 
          enum: ['low', 'medium', 'high'],
          description: 'Notification priority'
        },
        isRead: { bsonType: 'bool', description: 'Whether notification has been read' },
        createdAt: { bsonType: 'date', description: 'When notification was created' },
        readAt: { bsonType: 'date', description: 'When notification was read' },
        expiresAt: { bsonType: 'date', description: 'When notification expires' },
        actionUrl: { bsonType: 'string', description: 'URL for notification action' },
        metadata: { bsonType: 'object', description: 'Additional notification metadata' }
      }
    }
  },

  activity: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'action', 'entityType', 'entityId', 'entityName', 'description', 'createdAt'],
      properties: {
        userId: { bsonType: 'string', description: 'ID of user who performed action' },
        action: { bsonType: 'string', minLength: 1, description: 'Action performed' },
        entityType: { 
          bsonType: 'string', 
          enum: ['task', 'project', 'user', 'system'],
          description: 'Type of entity affected'
        },
        entityId: { bsonType: 'string', description: 'ID of entity affected' },
        entityName: { bsonType: 'string', description: 'Name of entity affected' },
        description: { bsonType: 'string', minLength: 1, description: 'Activity description' },
        metadata: { bsonType: 'object', description: 'Additional activity metadata' },
        createdAt: { bsonType: 'date', description: 'When activity occurred' },
        ipAddress: { bsonType: 'string', description: 'IP address of user' },
        userAgent: { bsonType: 'string', description: 'User agent string' }
      }
    }
  }
};

// Index definitions for performance
export const INDEX_DEFINITIONS = {
  users: [
    { key: { email: 1 }, unique: true },
    { key: { role: 1 } },
    { key: { isActive: 1 } },
    { key: { department: 1 } },
    { key: { createdAt: -1 } }
  ] as const,
  
  tasks: [
    { key: { assignedTo: 1 } },
    { key: { createdBy: 1 } },
    { key: { status: 1 } },
    { key: { priority: 1 } },
    { key: { projectId: 1 } },
    { key: { createdAt: -1 } },
    { key: { endDate: 1 } },
    { key: { dueDate: 1 } },
    { key: { department: 1 } },
    { key: { tags: 1 } },
    { key: { status: 1, assignedTo: 1 } },
    { key: { priority: 1, status: 1 } }
  ] as const,
  
  projects: [
    { key: { createdBy: 1 } },
    { key: { status: 1 } },
    { key: { priority: 1 } },
    { key: { category: 1 } },
    { key: { createdAt: -1 } },
    { key: { startDate: 1 } },
    { key: { endDate: 1 } },
    { key: { teamMembers: 1 } },
    { key: { department: 1 } }
  ] as const,
  
  notifications: [
    { key: { userId: 1, isRead: 1 } },
    { key: { userId: 1, createdAt: -1 } },
    { key: { type: 1 } },
    { key: { priority: 1 } },
    { key: { expiresAt: 1 } },
    { key: { createdAt: -1 } }
  ] as const,
  
  activity: [
    { key: { userId: 1, createdAt: -1 } },
    { key: { entityType: 1, entityId: 1 } },
    { key: { createdAt: -1 } },
    { key: { action: 1 } }
  ] as const
};

// Database setup function
export async function setupMongoSchemas(db: Db): Promise<void> {
  console.log('🔧 Setting up MongoDB schemas and indexes...');
  
  try {
    // Create collections with schema validation
    for (const [collectionName, schema] of Object.entries(SCHEMA_VALIDATION)) {
      try {
        await db.createCollection(collectionName, { validator: schema });
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (error: any) {
        if (error.code === 48) { // Collection already exists
          console.log(`ℹ️ Collection already exists: ${collectionName}`);
          // Update existing collection schema
          await db.command({
            collMod: collectionName,
            validator: schema,
            validationLevel: 'moderate'
          });
          console.log(`🔄 Updated schema for: ${collectionName}`);
        } else {
          throw error;
        }
      }
    }

    // Create indexes for performance
    for (const [collectionName, indexes] of Object.entries(INDEX_DEFINITIONS)) {
      const collection = db.collection(collectionName);
      
      for (const indexDef of indexes) {
        try {
          const indexOptions: any = {
            name: `${collectionName}_${Object.keys(indexDef.key).join('_')}_idx`
          };
          
          if ('unique' in indexDef) {
            indexOptions.unique = (indexDef as any).unique;
          }
          
          if ('sparse' in indexDef) {
            indexOptions.sparse = (indexDef as any).sparse;
          }
          
          await collection.createIndex(indexDef.key, indexOptions);
          console.log(`📊 Created index on ${collectionName}: ${JSON.stringify(indexDef.key)}`);
        } catch (error: any) {
          if (error.code === 68) { // Index already exists
            console.log(`ℹ️ Index already exists on ${collectionName}: ${JSON.stringify(indexDef.key)}`);
          } else {
            console.warn(`⚠️ Failed to create index on ${collectionName}:`, error.message);
          }
        }
      }
    }

    console.log('🎉 MongoDB schemas and indexes setup complete!');
  } catch (error) {
    console.error('❌ Failed to setup MongoDB schemas:', error);
    throw error;
  }
}

// Sample data insertion function
export async function insertSampleData(db: Db): Promise<void> {
  console.log('📝 Inserting sample data...');
  
  try {
    const usersCollection = db.collection('users');
    const tasksCollection = db.collection('tasks');
    const projectsCollection = db.collection('projects');
    const notificationsCollection = db.collection('notifications');

    // Check if data already exists
    const userCount = await usersCollection.countDocuments();
    if (userCount > 0) {
      console.log('ℹ️ Sample data already exists, skipping insertion');
      return;
    }

    // Insert sample users
    const sampleUsers = [
      {
        id: 'admin-001',
        name: 'Admin User',
        email: 'admin@hopebridge.com',
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        department: 'Management'
      },
      {
        id: 'coordinator-001',
        name: 'Project Coordinator',
        email: 'coordinator@hopebridge.com',
        role: 'PROJECT_COORDINATOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        department: 'Projects'
      },
      {
        id: 'field-officer-001',
        name: 'Field Officer',
        email: 'field@hopebridge.com',
        role: 'FIELD_OFFICER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        department: 'Operations'
      }
    ];

    await usersCollection.insertMany(sampleUsers);
    console.log('✅ Inserted sample users');

    // Insert sample projects
    const sampleProjects = [
      {
        title: 'School Renovation Project',
        description: 'Renovate local school to improve learning environment',
        status: 'active',
        priority: 'high',
        createdBy: 'admin-001',
        createdByName: 'Admin User',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        progress: 45,
        category: 'education',
        beneficiaries: 150,
        teamMembers: ['coordinator-001', 'field-officer-001'],
        department: 'Education'
      },
      {
        title: 'Healthcare Camp',
        description: 'Free healthcare camp for rural communities',
        status: 'planning',
        priority: 'medium',
        createdBy: 'admin-001',
        createdByName: 'Admin User',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        category: 'healthcare',
        beneficiaries: 300,
        department: 'Healthcare'
      }
    ];

    const projectResult = await projectsCollection.insertMany(sampleProjects);
    console.log('✅ Inserted sample projects');

    // Insert sample tasks
    const sampleTasks = [
      {
        title: 'Design School Layout',
        description: 'Create architectural design for school renovation',
        status: 'completed',
        priority: 'high',
        assignedTo: 'coordinator-001',
        assignedToName: 'Project Coordinator',
        createdBy: 'admin-001',
        createdByName: 'Admin User',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        progress: 100,
        projectId: projectResult.insertedIds[0]?.toString(),
        projectName: 'School Renovation Project',
        department: 'Education'
      },
      {
        title: 'Procure Building Materials',
        description: 'Purchase and arrange delivery of renovation materials',
        status: 'in_progress',
        priority: 'high',
        assignedTo: 'field-officer-001',
        assignedToName: 'Field Officer',
        createdBy: 'coordinator-001',
        createdByName: 'Project Coordinator',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        progress: 30,
        projectId: projectResult.insertedIds[0]?.toString(),
        projectName: 'School Renovation Project',
        alertBeforeDue: true,
        alertDays: 2,
        department: 'Operations'
      },
      {
        title: 'Volunteer Recruitment',
        description: 'Recruit volunteers for healthcare camp',
        status: 'pending',
        priority: 'medium',
        assignedTo: 'coordinator-001',
        assignedToName: 'Project Coordinator',
        createdBy: 'admin-001',
        createdByName: 'Admin User',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        progress: 0,
        projectId: projectResult.insertedIds[1]?.toString(),
        projectName: 'Healthcare Camp',
        department: 'HR'
      }
    ];

    const taskResult = await tasksCollection.insertMany(sampleTasks);
    console.log('✅ Inserted sample tasks');

    // Insert sample notifications
    const sampleNotifications = [
      {
        userId: 'coordinator-001',
        title: 'New Task Assigned',
        message: 'You have been assigned to "Procure Building Materials" task',
        type: 'task_assigned',
        priority: 'high',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        metadata: {
          taskId: taskResult.insertedIds[1]?.toString(),
          assignedBy: 'admin-001'
        }
      },
      {
        userId: 'field-officer-001',
        title: 'Task Due Soon',
        message: 'Your task "Procure Building Materials" is due in 5 days',
        type: 'deadline_reminder',
        priority: 'medium',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        metadata: {
          taskId: taskResult.insertedIds[1]?.toString()
        }
      }
    ];

    await notificationsCollection.insertMany(sampleNotifications);
    console.log('✅ Inserted sample notifications');

    console.log('🎉 Sample data insertion complete!');
  } catch (error) {
    console.error('❌ Failed to insert sample data:', error);
    throw error;
  }
}
