import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // First, ensure we have users
    const existingUsers = await prisma.user.findMany();
    
    if (existingUsers.length === 0) {
      // Create sample users if none exist
      const sampleUsers = [
        {
          id: 'user1',
          name: 'Sarah Chen',
          email: 'sarah@hopebridge.org',
          role: 'developer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'user2', 
          name: 'Michael Johnson',
          email: 'michael@hopebridge.org',
          role: 'manager',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'user3',
          name: 'Emily Davis',
          email: 'emily@hopebridge.org', 
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'user4',
          name: 'David Kim',
          email: 'david@hopebridge.org',
          role: 'developer',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'user5',
          name: 'Lisa Wilson',
          email: 'lisa@hopebridge.org',
          role: 'designer',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await prisma.user.createMany({
        data: sampleUsers
      });
    }

    // Get users for task assignment
    const users = await prisma.user.findMany();
    
    if (users.length < 2) {
      return NextResponse.json({
        error: 'Need at least 2 users to create sample tasks',
        currentUsers: users.length
      }, { status: 400 });
    }

    // Create sample tasks
    const sampleTasks = [
      {
        id: 'task1',
        title: 'Launch Hope Bridge Platform V2.0',
        description: 'Complete development and deployment of the enhanced task management platform with advanced AI features and real-time collaboration.',
        status: 'in_progress',
        priority: 'critical',
        category: 'Development',
        tags: ['urgent', 'platform', 'ai', 'collaboration'],
        assignedToId: users[0].id,
        createdById: users[1].id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        progress: 65,
        budget: 50000,
        actualCost: 32000,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date()
      },
      {
        id: 'task2',
        title: 'Design System Implementation',
        description: 'Create and implement a comprehensive design system with reusable components, color palettes, and typography guidelines.',
        status: 'active',
        priority: 'high',
        category: 'Design',
        tags: ['design', 'ui', 'components', 'system'],
        assignedToId: users[4].id, // Lisa Wilson (designer)
        createdById: users[2].id, // Emily Davis (admin)
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        progress: 40,
        budget: 25000,
        actualCost: 8000,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date()
      },
      {
        id: 'task3',
        title: 'Database Performance Optimization',
        description: 'Optimize database queries, add proper indexing, and implement caching strategies to improve application performance.',
        status: 'in_progress',
        priority: 'high',
        category: 'Development',
        tags: ['database', 'performance', 'optimization', 'backend'],
        assignedToId: users[3].id, // David Kim (developer)
        createdById: users[1].id, // Michael Johnson (manager)
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        progress: 80,
        budget: 15000,
        actualCost: 12000,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date()
      },
      {
        id: 'task4',
        title: 'User Testing and Feedback Collection',
        description: 'Conduct comprehensive user testing sessions and collect feedback for platform improvements.',
        status: 'active',
        priority: 'medium',
        category: 'Testing',
        tags: ['testing', 'feedback', 'ux', 'research'],
        assignedToId: users[2].id, // Emily Davis (admin)
        createdById: users[0].id, // Sarah Chen (developer)
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        progress: 25,
        budget: 8000,
        actualCost: 2000,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date()
      },
      {
        id: 'task5',
        title: 'Mobile App Development',
        description: 'Develop native mobile applications for iOS and Android platforms with full feature parity.',
        status: 'draft',
        priority: 'medium',
        category: 'Development',
        tags: ['mobile', 'ios', 'android', 'app'],
        assignedToId: users[3].id, // David Kim (developer)
        createdById: users[1].id, // Michael Johnson (manager)
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        progress: 10,
        budget: 75000,
        actualCost: 5000,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date()
      },
      {
        id: 'task6',
        title: 'Security Audit and Implementation',
        description: 'Conduct comprehensive security audit and implement recommended security measures.',
        status: 'completed',
        priority: 'critical',
        category: 'Security',
        tags: ['security', 'audit', 'compliance', 'safety'],
        assignedToId: users[2].id, // Emily Davis (admin)
        createdById: users[2].id, // Emily Davis (admin)
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue but completed)
        progress: 100,
        budget: 20000,
        actualCost: 18500,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        updatedAt: new Date()
      },
      {
        id: 'task7',
        title: 'API Documentation',
        description: 'Create comprehensive API documentation with examples and best practices.',
        status: 'review',
        priority: 'low',
        category: 'Documentation',
        tags: ['documentation', 'api', 'technical', 'writing'],
        assignedToId: users[0].id, // Sarah Chen (developer)
        createdById: users[1].id, // Michael Johnson (manager)
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        progress: 90,
        budget: 5000,
        actualCost: 4500,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        updatedAt: new Date()
      },
      {
        id: 'task8',
        title: 'Marketing Campaign Launch',
        description: 'Plan and execute marketing campaign for platform launch including social media and content marketing.',
        status: 'active',
        priority: 'medium',
        category: 'Marketing',
        tags: ['marketing', 'campaign', 'social-media', 'content'],
        assignedToId: users[4].id, // Lisa Wilson (designer)
        createdById: users[2].id, // Emily Davis (admin)
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        progress: 55,
        budget: 30000,
        actualCost: 15000,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        updatedAt: new Date()
      }
    ];

    // Create tasks one by one to avoid conflicts
    const createdTasks = [];
    for (const taskData of sampleTasks) {
      try {
        const task = await prisma.task.upsert({
          where: { id: taskData.id },
          update: taskData,
          create: taskData
        });
        createdTasks.push(task);
      } catch (error) {
        console.error(`Error creating task ${taskData.id}:`, error);
      }
    }

    // Create some sample attachments
    const sampleAttachments = [
      {
        id: 'att1',
        name: 'Platform Architecture.pdf',
        type: 'application/pdf',
        url: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
        taskId: 'task1'
      },
      {
        id: 'att2',
        name: 'Design System Guidelines.fig',
        type: 'application/figma',
        url: 'https://res.cloudinary.com/demo/image/upload/sample.fig',
        taskId: 'task2'
      },
      {
        id: 'att3',
        name: 'Database Schema.sql',
        type: 'text/sql',
        url: 'https://res.cloudinary.com/demo/image/upload/sample.sql',
        taskId: 'task3'
      }
    ];

    for (const attachmentData of sampleAttachments) {
      try {
        await prisma.taskAttachment.upsert({
          where: { id: attachmentData.id },
          update: attachmentData,
          create: attachmentData
        });
      } catch (error) {
        console.error(`Error creating attachment ${attachmentData.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data created successfully',
      data: {
        usersCreated: users.length,
        tasksCreated: createdTasks.length,
        attachmentsCreated: sampleAttachments.length,
        tasks: createdTasks.map(task => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          assignedTo: users.find((u: any) => u.id === task.assignedToId)?.name,
          createdBy: users.find((u: any) => u.id === task.createdById)?.name
        }))
      }
    });

  } catch (error) {
    console.error('Error creating sample data:', error);
    return NextResponse.json({
      error: 'Failed to create sample data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
