require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/task-management');
    
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Task.deleteMany({});
    await Project.deleteMany({});

    console.log('Creating users...');
    const users = await User.create([
      {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin'
      },
      {
        username: 'janesmith',
        email: 'jane@example.com',
        password: 'Password123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'manager'
      },
      {
        username: 'bobwilson',
        email: 'bob@example.com',
        password: 'Password123',
        firstName: 'Bob',
        lastName: 'Wilson',
        role: 'user'
      },
      {
        username: 'alicejohnson',
        email: 'alice@example.com',
        password: 'Password123',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'user'
      }
    ]);

    console.log('Creating projects...');
    const projects = await Project.create([
      {
        name: 'Website Redesign',
        description: 'Complete redesign of company website',
        owner: users[1]._id,
        members: [
          { user: users[1]._id, role: 'owner' },
          { user: users[2]._id, role: 'member' },
          { user: users[3]._id, role: 'member' }
        ],
        color: '#3B82F6'
      },
      {
        name: 'Mobile App Development',
        description: 'Native mobile app for iOS and Android',
        owner: users[0]._id,
        members: [
          { user: users[0]._id, role: 'owner' },
          { user: users[3]._id, role: 'member' }
        ],
        color: '#10B981'
      }
    ]);

    console.log('Creating tasks...');
    const now = new Date();
    const tasks = await Task.create([
      {
        title: 'Fix critical bug in payment system',
        description: 'Customers are reporting issues with payment processing. This needs immediate attention.',
        status: 'pending',
        priority: 'urgent',
        createdBy: users[0]._id,
        assignedTo: users[2]._id,
        dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        tags: ['bug', 'urgent', 'payment'],
        projectId: projects[0]._id,
        activity: [{
          action: 'created',
          description: 'Task created by John Doe',
          user: users[0]._id,
          timestamp: now
        }]
      },
      {
        title: 'Design new landing page mockups',
        description: 'Create mockups for the new landing page design following brand guidelines.',
        status: 'in_progress',
        priority: 'high',
        createdBy: users[1]._id,
        assignedTo: users[3]._id,
        dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        tags: ['design', 'ui/ux'],
        projectId: projects[0]._id,
        activity: [{
          action: 'created',
          description: 'Task created by Jane Smith',
          user: users[1]._id,
          timestamp: now
        }]
      },
      {
        title: 'Implement user authentication',
        description: 'Set up JWT-based authentication system with login, registration, and password reset.',
        status: 'pending',
        priority: 'medium',
        createdBy: users[0]._id,
        assignedTo: users[2]._id,
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        tags: ['backend', 'security', 'auth'],
        projectId: projects[1]._id,
        activity: [{
          action: 'created',
          description: 'Task created by John Doe',
          user: users[0]._id,
          timestamp: now
        }]
      },
      {
        title: 'Write API documentation',
        description: 'Document all API endpoints with examples and usage instructions.',
        status: 'completed',
        priority: 'low',
        createdBy: users[1]._id,
        assignedTo: users[3]._id,
        dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        tags: ['documentation', 'api'],
        projectId: projects[1]._id,
        completedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        activity: [{
          action: 'created',
          description: 'Task created by Jane Smith',
          user: users[1]._id,
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
        }, {
          action: 'completed',
          description: 'Task completed by Alice Johnson',
          user: users[3]._id,
          timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000)
        }]
      },
      {
        title: 'Optimize database queries',
        description: 'Review and optimize slow database queries to improve application performance.',
        status: 'pending',
        priority: 'medium',
        createdBy: users[0]._id,
        assignedTo: users[2]._id,
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        tags: ['backend', 'performance', 'database'],
        projectId: projects[1]._id,
        activity: [{
          action: 'created',
          description: 'Task created by John Doe',
          user: users[0]._id,
          timestamp: now
        }]
      },
      {
        title: 'User testing session preparation',
        description: 'Prepare materials and schedule user testing sessions for the new features.',
        status: 'pending',
        priority: 'high',
        createdBy: users[1]._id,
        assignedTo: users[3]._id,
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        tags: ['testing', 'ux'],
        projectId: projects[0]._id,
        activity: [{
          action: 'created',
          description: 'Task created by Jane Smith',
          user: users[1]._id,
          timestamp: now
        }]
      }
    ]);

    console.log('Adding sample comments...');
    await Task.findByIdAndUpdate(tasks[0]._id, {
      $push: {
        comments: {
          text: 'I've identified the issue in the payment gateway integration. Working on a fix now.',
          author: users[2]._id,
          createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000)
        }
      }
    });

    await Task.findByIdAndUpdate(tasks[1]._id, {
      $push: {
        comments: {
          text: 'Created initial wireframes. Please review and provide feedback.',
          author: users[3]._id,
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
        }
      }
    });

    console.log('Seed data created successfully!');
    console.log(`\nUsers created: ${users.length}`);
    console.log(`Projects created: ${projects.length}`);
    console.log(`Tasks created: ${tasks.length}`);
    
    console.log('\nLogin credentials:');
    console.log('Admin: john@example.com / Password123');
    console.log('Manager: jane@example.com / Password123');
    console.log('User: bob@example.com / Password123');
    console.log('User: alice@example.com / Password123');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
