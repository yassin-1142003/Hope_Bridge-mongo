import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ObjectId } from 'mongoose';
import { EnhancedProject } from '../../db/schemas/enhanced-project.schema';
import { EnhancedUser } from '../../db/schemas/enhanced-user.schema';
import { Donation } from '../../db/schemas/donation.schema';
import { Task } from '../../db/schemas/task.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(EnhancedProject.name) private projectModel: Model<EnhancedProject>,
    @InjectModel(EnhancedUser.name) private userModel: Model<EnhancedUser>,
    @InjectModel(Donation.name) private donationModel: Model<Donation>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
  ) {}

  async getDashboardStats(userId?: string) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Get all stats in parallel for better performance
      const [
        totalProjects,
        activeProjects,
        completedProjects,
        totalUsers,
        activeUsers,
        totalDonations,
        monthlyDonations,
        yearlyDonations,
        totalTasks,
        completedTasks,
        pendingTasks,
        recentProjects,
        topDonors,
        recentActivity,
      ] = await Promise.all([
        // Project stats
        this.projectModel.countDocuments(),
        this.projectModel.countDocuments({ status: 'ACTIVE' }),
        this.projectModel.countDocuments({ status: 'COMPLETED' }),
        
        // User stats
        this.userModel.countDocuments(),
        this.userModel.countDocuments({ isActive: true }),
        
        // Donation stats
        this.donationModel.countDocuments(),
        this.donationModel.aggregate([
          { $match: { createdAt: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        this.donationModel.aggregate([
          { $match: { createdAt: { $gte: startOfYear } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        
        // Task stats
        this.taskModel.countDocuments(),
        this.taskModel.countDocuments({ status: 'completed' }),
        this.taskModel.countDocuments({ status: 'pending' }),
        
        // Recent data
        this.projectModel.find().sort({ createdAt: -1 }).limit(5).select('title status createdAt currentAmount targetAmount'),
        this.donationModel.aggregate([
          { $group: { _id: '$userId', total: { $sum: '$amount' }, count: { $sum: 1 } } },
          { $sort: { total: -1 } },
          { $limit: 5 },
          { $lookup: { from: 'enhancedusers', localField: '_id', foreignField: '_id', as: 'user' } },
          { $unwind: '$user' },
          { $project: { 'user.name': 1, 'user.email': 1, total: 1, count: 1 } },
        ]),
        
        // Recent activity (simplified - you can expand this)
        this.projectModel.find().sort({ updatedAt: -1 }).limit(10).select('title updatedAt'),
      ]);

      // Calculate totals
      const monthlyTotal = monthlyDonations[0]?.total || 0;
      const yearlyTotal = yearlyDonations[0]?.total || 0;

      // Calculate completion rates
      const projectCompletionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
      const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        overview: {
          totalProjects,
          activeProjects,
          completedProjects,
          projectCompletionRate: Math.round(projectCompletionRate),
          totalUsers,
          activeUsers,
          userEngagementRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
        },
        financials: {
          totalDonations,
          monthlyDonations: monthlyTotal,
          yearlyDonations: yearlyTotal,
          avgDonation: totalDonations > 0 ? Math.round(monthlyTotal / totalDonations) : 0,
        },
        tasks: {
          totalTasks,
          completedTasks,
          pendingTasks,
          taskCompletionRate: Math.round(taskCompletionRate),
        },
        recent: {
          projects: recentProjects,
          topDonors,
          activity: recentActivity,
        },
        charts: {
          projectStatus: {
            active: activeProjects,
            completed: completedProjects,
            pending: totalProjects - activeProjects - completedProjects,
          },
          userActivity: {
            active: activeUsers,
            inactive: totalUsers - activeUsers,
          },
          taskStatus: {
            completed: completedTasks,
            pending: pendingTasks,
            inProgress: totalTasks - completedTasks - pendingTasks,
          },
        },
      };
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      throw error;
    }
  }

  async getUserDashboard(userId: string) {
    try {
      const [
        userProjects,
        userDonations,
        userTasks,
        userStats,
        recommendedProjects,
      ] = await Promise.all([
        this.projectModel.find({ 
          $or: [
            { createdBy: userId },
            { volunteers: userId },
            { projectManager: userId },
          ]
        }).sort({ createdAt: -1 }).limit(10),
        
        this.donationModel.find({ userId }).sort({ createdAt: -1 }).limit(10),
        
        this.taskModel.find({ assignedTo: userId }).sort({ createdAt: -1 }).limit(10),
        
        this.userModel.findById(userId).select('name email role createdAt'),
        
        this.projectModel.find({ 
          status: 'ACTIVE',
          featured: true,
          $or: [
            { createdBy: { $ne: userId } },
            { volunteers: { $ne: userId } },
          ]
        }).sort({ createdAt: -1 }).limit(5),
      ]);

      const totalDonated = userDonations.reduce((sum, donation) => sum + donation.amount, 0);
      const totalProjectsCreated = userProjects.filter(p => p.createdBy?.toString() === userId).length;
      const totalTasksCompleted = userTasks.filter(t => t.status === 'completed').length;

      return {
        user: userStats,
        stats: {
          projectsCreated: totalProjectsCreated,
          projectsVolunteered: userProjects.filter(p => p.volunteers.includes(new Types.ObjectId(userId))).length,
          totalDonated,
          donationsCount: userDonations.length,
          tasksAssigned: userTasks.length,
          tasksCompleted: totalTasksCompleted,
        },
        projects: userProjects,
        donations: userDonations,
        tasks: userTasks,
        recommended: recommendedProjects,
      };
    } catch (error) {
      console.error('Failed to get user dashboard:', error);
      throw error;
    }
  }

  async getProjectAnalytics(projectId: string) {
    try {
      const project = await this.projectModel.findById(projectId)
        .populate('createdBy', 'name email')
        .populate('volunteers', 'name email')
        .populate('projectManager', 'name email');

      if (!project) {
        throw new Error('Project not found');
      }

      const donations = await this.donationModel.find({ projectId })
        .sort({ createdAt: -1 })
        .populate('userId', 'name email');

      const tasks = await this.taskModel.find({ projectId })
        .populate('assignedTo', 'name email');

      const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);
      const uniqueDonors = new Set(donations.map(d => (d as any).userId)).size;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;

      return {
        project,
        stats: {
          totalDonated,
          uniqueDonors,
          donationsCount: donations.length,
          avgDonation: donations.length > 0 ? totalDonated / donations.length : 0,
          progressPercentage: Math.round((totalDonated / project.targetAmount) * 100),
          totalVolunteers: project.volunteers.length,
          totalTasks: tasks.length,
          completedTasks,
          taskCompletionRate: tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0,
        },
        donations: donations.slice(0, 20), // Recent donations
        tasks: tasks.slice(0, 20), // Recent tasks
      };
    } catch (error) {
      console.error('Failed to get project analytics:', error);
      throw error;
    }
  }
}
