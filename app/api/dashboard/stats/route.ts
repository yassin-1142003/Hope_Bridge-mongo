import { NextRequest, NextResponse } from 'next/server';
import { getHopeBridgeModels } from '@/lib/database/models/hopebridge';
import { getTaskManagementModels } from '@/lib/database/models/taskManagement';
import DatabaseManager from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const dbManager = DatabaseManager.getInstance();
    
    // Connect to all databases
    if (!dbManager.isConnected('hopebridge')) {
      await dbManager.connect('hopebridge');
    }
    if (!dbManager.isConnected('taskManagement')) {
      await dbManager.connect('taskManagement');
    }
    
    // Get models
    const { User, Project, Donation, Volunteer } = getHopeBridgeModels();
    const { Task, TaskUser, TaskProject } = getTaskManagementModels();
    
    // Hope Bridge Statistics
    const [
      totalUsers,
      activeUsers,
      totalProjects,
      activeProjects,
      totalDonations,
      completedDonations,
      totalVolunteers,
      approvedVolunteers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Project.countDocuments(),
      Project.countDocuments({ isActive: true, status: 'ACTIVE' }),
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'COMPLETED' }),
      Volunteer.countDocuments(),
      Volunteer.countDocuments({ status: 'APPROVED' })
    ]);
    
    // Financial Statistics
    const donationStats = await Donation.aggregate([
      { $match: { status: 'COMPLETED' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
          highestDonation: { $max: '$amount' }
        }
      }
    ]);
    
    const financialStats = donationStats[0] || {
      totalAmount: 0,
      averageAmount: 0,
      highestDonation: 0
    };
    
    // Project Progress Statistics
    const projectStats = await Project.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalTarget: { $sum: '$targetAmount' },
          totalRaised: { $sum: '$currentAmount' }
        }
      }
    ]);
    
    // Task Management Statistics
    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      totalTaskUsers,
      totalTaskProjects
    ] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: 'COMPLETED' }),
      Task.countDocuments({ status: 'IN_PROGRESS' }),
      Task.countDocuments({ 
        status: { $in: ['TODO', 'IN_PROGRESS'] },
        dueDate: { $lt: new Date() }
      }),
      TaskUser.countDocuments({ isActive: true }),
      TaskProject.countDocuments({ isActive: true })
    ]);
    
    // Task Priority Statistics
    const taskPriorityStats = await Task.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Recent Activity
    const [recentDonations, recentTasks, recentVolunteers] = await Promise.all([
      Donation.find()
        .populate('user', 'name avatar')
        .populate('project', 'title')
        .sort({ createdAt: -1 })
        .limit(5),
      
      Task.find()
        .populate('assignedTo', 'name avatar')
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      
      Volunteer.find()
        .populate('user', 'name avatar')
        .populate('project', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);
    
    // Monthly Statistics (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const [monthlyDonations, monthlyTasks] = await Promise.all([
      Donation.aggregate([
        { $match: { status: 'COMPLETED', createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            amount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      
      Task.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            created: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        hopeBridge: {
          users: {
            total: totalUsers,
            active: activeUsers,
            inactive: totalUsers - activeUsers
          },
          projects: {
            total: totalProjects,
            active: activeProjects,
            completed: await Project.countDocuments({ status: 'COMPLETED' })
          },
          donations: {
            total: totalDonations,
            completed: completedDonations,
            pending: await Donation.countDocuments({ status: 'PENDING' }),
            failed: await Donation.countDocuments({ status: 'FAILED' })
          },
          volunteers: {
            total: totalVolunteers,
            approved: approvedVolunteers,
            pending: await Volunteer.countDocuments({ status: 'PENDING' })
          },
          financial: financialStats,
          projectsByCategory: projectStats
        },
        taskManagement: {
          tasks: {
            total: totalTasks,
            completed: completedTasks,
            inProgress: inProgressTasks,
            overdue: overdueTasks,
            todo: await Task.countDocuments({ status: 'TODO' })
          },
          users: {
            total: totalTaskUsers,
            active: await TaskUser.countDocuments({ isActive: true })
          },
          projects: {
            total: totalTaskProjects,
            active: await TaskProject.countDocuments({ isActive: true })
          },
          tasksByPriority: taskPriorityStats
        },
        recentActivity: {
          donations: recentDonations,
          tasks: recentTasks,
          volunteers: recentVolunteers
        },
        monthlyStats: {
          donations: monthlyDonations,
          tasks: monthlyTasks
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
