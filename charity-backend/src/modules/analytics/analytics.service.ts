import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EnhancedProject } from '../../db/schemas/enhanced-project.schema';
import { EnhancedUser } from '../../db/schemas/enhanced-user.schema';

export interface VisitDocument {
  projectId: string;
  userId?: string;
  path: string;
  locale: string;
  referrer: string;
  userAgent: string;
  userType: 'user' | 'guest';
  timestamp: Date;
  duration: number;
  sessionId: string;
  metadata: any;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel('Visit') private visitModel: Model<VisitDocument>,
    @InjectModel(EnhancedProject.name) private projectModel: Model<EnhancedProject>,
    @InjectModel(EnhancedUser.name) private userModel: Model<EnhancedUser>,
  ) {}

  async trackVisit(visitData: Partial<VisitDocument>) {
    try {
      // Verify project exists
      const project = await this.projectModel.findById(visitData.projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // If user ID provided, verify user exists
      if (visitData.userId) {
        const user = await this.userModel.findById(visitData.userId);
        if (!user) {
          throw new Error('User not found');
        }
      }

      const visit = new this.visitModel({
        ...visitData,
        timestamp: new Date(),
      });

      await visit.save();

      // Update project visit statistics
      await this.projectModel.findByIdAndUpdate(visitData.projectId, {
        $inc: { 'analytics.totalViews': 1 },
        $set: { 'analytics.lastViewed': new Date() },
      });

      console.log(`📊 Visit tracked: ${visitData.projectId} (${visitData.userType})`);
      return { success: true, visitId: visit._id };
    } catch (error) {
      console.error('Failed to track visit:', error);
      throw error;
    }
  }

  async getProjectAnalytics(projectId: string, timeframe: 'day' | 'week' | 'month' | 'year' = 'week') {
    try {
      const now = new Date();
      let startDate: Date;

      switch (timeframe) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }

      const analytics = await this.visitModel.aggregate([
        {
          $match: {
            projectId: new Types.ObjectId(projectId),
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              userType: '$userType',
            },
            visits: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            avgDuration: { $avg: '$duration' },
          },
        },
        {
          $group: {
            _id: '$_id.date',
            totalVisits: { $sum: '$visits' },
            userVisits: {
              $sum: {
                $cond: [{ $eq: ['$_id.userType', 'user'] }, '$visits', 0],
              },
            },
            guestVisits: {
              $sum: {
                $cond: [{ $eq: ['$_id.userType', 'guest'] }, '$visits', 0],
              },
            },
            uniqueUsers: { $sum: { $size: '$uniqueUsers' } },
            avgDuration: { $avg: '$avgDuration' },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return {
        projectId,
        timeframe,
        data: analytics,
        summary: {
          totalVisits: analytics.reduce((sum, day) => sum + day.totalVisits, 0),
          totalUniqueUsers: analytics.reduce((sum, day) => sum + day.uniqueUsers, 0),
          avgDuration: analytics.reduce((sum, day) => sum + day.avgDuration, 0) / analytics.length || 0,
        },
      };
    } catch (error) {
      console.error('Failed to get project analytics:', error);
      throw error;
    }
  }

  async getUserVisitHistory(userId: string, limit: number = 50) {
    try {
      const visits = await this.visitModel
        .find({ userId })
        .populate('projectId', 'title slug thumbnail')
        .sort({ timestamp: -1 })
        .limit(limit);

      return visits;
    } catch (error) {
      console.error('Failed to get user visit history:', error);
      throw error;
    }
  }

  async getDashboardAnalytics() {
    try {
      const [
        totalVisits,
        uniqueUsers,
        popularProjects,
        recentActivity,
      ] = await Promise.all([
        this.visitModel.countDocuments(),
        this.visitModel.distinct('userId').then(users => users.filter(id => id).length),
        this.visitModel.aggregate([
          { $group: { _id: '$projectId', visits: { $sum: 1 } } },
          { $sort: { visits: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'projects',
              localField: '_id',
              foreignField: '_id',
              as: 'project',
            },
          },
        ]),
        this.visitModel
          .find()
          .populate('projectId', 'title')
          .populate('userId', 'name email')
          .sort({ timestamp: -1 })
          .limit(20),
      ]);

      return {
        overview: {
          totalVisits,
          uniqueUsers,
          avgSessionDuration: await this.getAvgSessionDuration(),
        },
        popularProjects,
        recentActivity,
      };
    } catch (error) {
      console.error('Failed to get dashboard analytics:', error);
      throw error;
    }
  }

  private async getAvgSessionDuration(): Promise<number> {
    try {
      const result = await this.visitModel.aggregate([
        { $group: { _id: null, avgDuration: { $avg: '$duration' } } },
      ]);
      return result[0]?.avgDuration || 0;
    } catch (error) {
      return 0;
    }
  }
}
