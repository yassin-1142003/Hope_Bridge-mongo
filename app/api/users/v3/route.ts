/**
 * 🚀 ENHANCED USERS API v3.0
 * 
 * Ultimate user management API with:
 * - Advanced user profiles
 * - Role and permission management
 * - User analytics and insights
 * - Activity tracking
 * - Team management
 * - Performance metrics
 * - Avatar management
 * - User preferences
 * - Social features
 * - Audit logging
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { UserRole, hasPermission } from "@/lib/roles";
import bcrypt from 'bcryptjs';
import { 
  createEnhancedAPI, 
  APIUtils, 
  API_CONFIG 
} from "@/lib/apiEnhancements";
import { 
  createSuccessResponse, 
  createCreatedResponse, 
  createBadRequestResponse, 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  createNotFoundResponse, 
  handleApiError, 
  setCorsHeaders 
} from "@/lib/apiResponse";

// 🎯 Enhanced User Schemas
const createUserSchemaV3 = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  role: z.enum(['admin', 'manager', 'developer', 'designer', 'tester', 'user']).default('user'),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  
  // 📱 Contact Information
  phone: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
  timezone: z.string().max(50).default('UTC'),
  language: z.string().max(10).default('en'),
  
  // 🏢 Organization
  managerId: z.string().email().optional(),
  teamId: z.string().optional(),
  reportsTo: z.array(z.string().email()).optional(),
  
  // 💼 Skills & Expertise
  skills: z.array(z.string().max(50)).max(20).optional(),
  expertise: z.array(z.string().max(100)).max(10).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string().datetime(),
    expiryDate: z.string().datetime().optional(),
    credentialId: z.string().optional()
  })).optional(),
  
  // 📊 Performance
  experienceLevel: z.enum(['junior', 'mid', 'senior', 'lead', 'principal']).default('junior'),
  availability: z.enum(['full_time', 'part_time', 'contract', 'intern', 'unavailable']).default('full_time'),
  workload: z.number().min(0).max(100).default(100),
  
  // 🎯 Preferences
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      sms: z.boolean().default(false),
      taskAssignments: z.boolean().default(true),
      projectUpdates: z.boolean().default(true),
      teamAnnouncements: z.boolean().default(true),
      deadlineReminders: z.boolean().default(true)
    }).default({}),
    dashboard: z.object({
      layout: z.string().default('default'),
      widgets: z.array(z.string()).default([]),
      refreshInterval: z.number().min(30).max(300).default(60)
    }).default({}),
    privacy: z.object({
      showEmail: z.boolean().default(false),
      showPhone: z.boolean().default(false),
      showLocation: z.boolean().default(true),
      allowDirectMessages: z.boolean().default(true),
      showActivity: z.boolean().default(true)
    }).default({})
  }).optional(),
  
  // 📸 Profile
  bio: z.string().max(1000).optional(),
  website: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  twitter: z.string().url().optional(),
  
  // 🎯 Onboarding
  onboardingStatus: z.enum(['not_started', 'in_progress', 'completed']).default('not_started'),
  onboardingStep: z.number().min(0).max(10).default(0)
});

const updateUserSchemaV3 = createUserSchemaV3.partial().omit({
  email: true, // Email cannot be changed after creation
  password: true // Password changed through separate endpoint
});

const userQuerySchemaV3 = z.object({
  // 📊 Basic Filters
  role: z.array(z.string()).optional(),
  department: z.array(z.string()).optional(),
  position: z.array(z.string()).optional(),
  teamId: z.array(z.string()).optional(),
  experienceLevel: z.array(z.string()).optional(),
  availability: z.array(z.string()).optional(),
  
  // 🔍 Search
  search: z.string().max(500).optional(),
  searchIn: z.array(z.enum(['name', 'email', 'bio', 'skills', 'expertise'])).default(['name', 'email']),
  
  // 📍 Location
  location: z.string().optional(),
  timezone: z.string().optional(),
  
  // 📊 Skills & Expertise
  skills: z.array(z.string()).optional(),
  hasSkills: z.boolean().optional(),
  
  // 📊 Performance
  minWorkload: z.number().min(0).max(100).optional(),
  maxWorkload: z.number().min(0).max(100).optional(),
  
  // 📅 Date Filters
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  lastActiveAfter: z.string().datetime().optional(),
  lastActiveBefore: z.string().datetime().optional(),
  
  // 📊 Status
  isActive: z.boolean().optional(),
  isOnline: z.boolean().optional(),
  onboardingStatus: z.array(z.string()).optional(),
  
  // 📄 Sorting & Pagination
  sortBy: z.enum(['name', 'email', 'createdAt', 'lastActiveAt', 'role', 'department', 'experienceLevel']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  
  // 📊 Includes
  includeStats: z.boolean().default(false),
  includeActivity: z.boolean().default(false),
  includeSkills: z.boolean().default(true),
  includePreferences: z.boolean().default(false),
  includeManager: z.boolean().default(false),
  includeTeam: z.boolean().default(false),
  includeReports: z.boolean().default(false),
  
  // 📊 Analytics
  includeAnalytics: z.boolean().default(false),
  groupBy: z.enum(['role', 'department', 'experienceLevel', 'availability', 'team']).optional(),
  
  // 🎯 Special Queries
  availableForAssignment: z.boolean().optional(),
  hasCertifications: z.boolean().optional()
});

// 🚀 Enhanced User Manager
class EnhancedUserManager {
  // 👤 Create User
  async createUserV3(userData: any, session: any, enhancers: any): Promise<any> {
    const usersCollection = await getCollection('users');
    const activityCollection = await getCollection('activity_logs');
    
    // 🎯 Check if user already exists
    const existingUser = await usersCollection.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // 🔐 Hash Password
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    // 🎯 Generate User ID
    const userId = new ObjectId();
    const userNumber = await this.generateUserNumber();
    
    // 📊 Create User Record
    const user = {
      _id: userId,
      userNumber,
      ...userData,
      password: hashedPassword,
      
      // 📊 Metadata
      createdBy: session.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // 📊 Status
      isActive: true,
      isOnline: false,
      isEmailVerified: false,
      emailVerificationToken: this.generateVerificationToken(),
      
      // 📊 Activity Tracking
      lastActiveAt: new Date(),
      lastLoginAt: null,
      loginCount: 0,
      
      // 📊 Profile Completion
      profileCompletion: this.calculateProfileCompletion(userData),
      
      // 📊 Analytics
      analytics: {
        tasksAssigned: 0,
        tasksCompleted: 0,
        projectsParticipated: 0,
        hoursLogged: 0,
        averageTaskCompletionTime: 0,
        performanceScore: 0,
        teamCollaborationScore: 0
      },
      
      // 📊 Social Features
      followers: [],
      following: [],
      connections: [],
      
      // 📊 Notifications
      notificationSettings: userData.preferences?.notifications || {
        email: true,
        push: true,
        sms: false,
        taskAssignments: true,
        projectUpdates: true,
        teamAnnouncements: true,
        deadlineReminders: true
      },
      
      // 📊 Session Management
      sessions: [],
      
      // 📊 Version
      version: 1
    };
    
    // 💾 Save User
    await usersCollection.insertOne(user);
    
    // 📊 Update Team Counts
    if (userData.teamId) {
      await this.updateTeamCounts(userData.teamId);
    }
    
    // 📊 Update Manager Reports
    if (userData.managerId) {
      await this.updateManagerReports(userData.managerId);
    }
    
    // 📊 Log Activity
    await this.logActivity({
      type: 'user_created',
      userId: userId.toString(),
      userNumber,
      actionBy: session.user.email,
      details: {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department
      }
    });
    
    // 📊 Send Welcome Email (would integrate with email service)
    await this.sendWelcomeEmail(user);
    
    // 📊 Cache Invalidation
    await enhancers.cacheManager.clear(`users:*`);
    
    // 🎯 Remove password from response
    const { password, emailVerificationToken, ...userResponse } = user;
    
    return userResponse;
  }
  
  // 👥 Get Users
  async getUsersV3(query: any, session: any, enhancers: any): Promise<any> {
    const usersCollection = await getCollection('users');
    
    // 🎯 Build Query
    const dbQuery = await this.buildUserQuery(query, session);
    
    // 📊 Get Total Count
    const total = await usersCollection.countDocuments(dbQuery);
    
    // 📊 Build Aggregation Pipeline
    const pipeline: any[] = [
      { $match: dbQuery },
      { $sort: { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 } }
    ];
    
    // 📊 Include Manager
    if (query.includeManager) {
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'managerId',
          foreignField: 'email',
          as: 'manager',
          pipeline: [
            { $project: { _id: 1, name: 1, email: 1, role: 1, avatar: 1 } }
          ]
        }
      });
    }
    
    // 📊 Include Team
    if (query.includeTeam) {
      pipeline.push({
        $lookup: {
          from: 'teams',
          localField: 'teamId',
          foreignField: '_id',
          as: 'team',
          pipeline: [
            { $project: { _id: 1, name: 1, description: 1 } }
          ]
        }
      });
    }
    
    // 📊 Include Reports
    if (query.includeReports) {
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'email',
          foreignField: 'managerId',
          as: 'reports',
          pipeline: [
            { $project: { _id: 1, name: 1, email: 1, role: 1, avatar: 1, isActive: 1 } }
          ]
        }
      });
    }
    
    // 📊 Include Stats
    if (query.includeStats) {
      pipeline.push({
        $lookup: {
          from: 'tasks',
          let: { userEmail: '$email' },
          pipeline: [
            { $match: { $expr: { $eq: ['$assignedTo', '$$userEmail'] } } },
            {
              $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                overdueTasks: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $lt: ['$dueDate', new Date()] },
                          { $ne: ['$status', 'completed'] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],
          as: 'taskStats'
        }
      });
    }
    
    // 📊 Include Activity
    if (query.includeActivity) {
      pipeline.push({
        $lookup: {
          from: 'activity_logs',
          let: { userEmail: '$email' },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$userEmail'] } } },
            { $sort: { timestamp: -1 } },
            { $limit: 10 },
            { $project: { type: 1, timestamp: 1, details: 1 } }
          ],
          as: 'recentActivity'
        }
      });
    }
    
    // 📊 Pagination
    pipeline.push(
      { $skip: (query.page - 1) * query.limit },
      { $limit: query.limit }
    );
    
    // 📊 Execute Query
    const users = await usersCollection.aggregate(pipeline).toArray();
    
    // 🎯 Remove sensitive data
    const sanitizedUsers = users.map(user => {
      const { password, emailVerificationToken, sessions, ...sanitized } = user;
      return sanitized;
    });
    
    // 📊 Calculate Analytics
    let analytics = null;
    if (query.includeAnalytics) {
      analytics = await this.calculateUsersAnalytics(dbQuery, query.groupBy);
    }
    
    // 📊 Pagination
    const pagination = APIUtils.createPagination(query.page, query.limit, total);
    
    return {
      users: sanitizedUsers,
      pagination,
      analytics,
      filters: {
        role: query.role,
        department: query.department,
        search: query.search,
        isActive: query.isActive
      },
      meta: {
        total,
        executionTime: Date.now(),
        cacheHit: false
      }
    };
  }
  
  // 📝 Update User
  async updateUserV3(userId: string, updateData: any, session: any, enhancers: any): Promise<any> {
    const usersCollection = await getCollection('users');
    
    // 🎯 Validate User Exists
    const existingUser = await usersCollection.findOne({ 
      _id: new ObjectId(userId),
      isActive: true 
    });
    
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    // 🎯 Check Permissions
    if (!this.canEditUser(existingUser, session)) {
      throw new Error('Insufficient permissions to edit this user');
    }
    
    // 📊 Build Update Data
    const updateFields = {
      ...updateData,
      updatedAt: new Date(),
      updatedBy: session.user.email,
      version: existingUser.version + 1
    };
    
    // 📊 Update Profile Completion
    if (updateData) {
      updateFields.profileCompletion = this.calculateProfileCompletion({
        ...existingUser,
        ...updateData
      });
    }
    
    // 📊 Update User
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      throw new Error('Failed to update user');
    }
    
    // 📊 Get Updated User
    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    // 📊 Log Activity
    await this.logActivity({
      type: 'user_updated',
      userId,
      actionBy: session.user.email,
      details: {
        changes: this.getUserChanges(existingUser, updateData)
      }
    });
    
    // 📊 Cache Invalidation
    await enhancers.cacheManager.clear(`users:*`);
    
    // 🎯 Remove sensitive data
    const { password, emailVerificationToken, sessions, ...userResponse } = updatedUser;
    
    return userResponse;
  }
  
  // 🗑️ Deactivate User
  async deactivateUserV3(userId: string, session: any, enhancers: any): Promise<void> {
    const usersCollection = await getCollection('users');
    
    // 🎯 Validate User Exists
    const existingUser = await usersCollection.findOne({ 
      _id: new ObjectId(userId),
      isActive: true 
    });
    
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    // 🎯 Check Permissions
    if (!this.canDeactivateUser(existingUser, session)) {
      throw new Error('Insufficient permissions to deactivate this user');
    }
    
    // 📊 Check for Active Tasks
    const tasksCollection = await getCollection('tasks');
    const activeTasks = await tasksCollection.countDocuments({
      assignedTo: existingUser.email,
      status: { $nin: ['completed', 'cancelled'] }
    });
    
    if (activeTasks > 0) {
      throw new Error('Cannot deactivate user with active tasks');
    }
    
    // 📊 Deactivate User
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: session.user.email,
          sessions: [] // Clear all sessions
        }
      }
    );
    
    // 📊 Update Team Counts
    if (existingUser.teamId) {
      await this.updateTeamCounts(existingUser.teamId);
    }
    
    // 📊 Update Manager Reports
    if (existingUser.managerId) {
      await this.updateManagerReports(existingUser.managerId);
    }
    
    // 📊 Log Activity
    await this.logActivity({
      type: 'user_deactivated',
      userId,
      actionBy: session.user.email,
      details: {
        name: existingUser.name,
        email: existingUser.email,
        reason: 'Deactivated by admin'
      }
    });
    
    // 📊 Cache Invalidation
    await enhancers.cacheManager.clear(`users:*`);
  }
  
  // 🔧 Helper Methods
  private async generateUserNumber(): Promise<string> {
    const usersCollection = await getCollection('users');
    const count = await usersCollection.countDocuments();
    return `USR-${String(count + 1).padStart(6, '0')}`;
  }
  
  private generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  private calculateProfileCompletion(userData: any): number {
    const fields = [
      'name', 'email', 'role', 'department', 'position', 'phone', 'location',
      'bio', 'website', 'skills', 'expertise', 'experienceLevel', 'availability'
    ];
    
    const completedFields = fields.filter(field => userData[field] && userData[field] !== '');
    return Math.round((completedFields.length / fields.length) * 100);
  }
  
  private async buildUserQuery(query: any, session: any): Promise<any> {
    const dbQuery: any = {};
    
    // 📊 Basic Filters
    if (query.role && query.role.length > 0) {
      dbQuery.role = { $in: query.role };
    }
    
    if (query.department && query.department.length > 0) {
      dbQuery.department = { $in: query.department };
    }
    
    if (query.position && query.position.length > 0) {
      dbQuery.position = { $in: query.position };
    }
    
    if (query.teamId && query.teamId.length > 0) {
      dbQuery.teamId = { $in: query.teamId };
    }
    
    if (query.experienceLevel && query.experienceLevel.length > 0) {
      dbQuery.experienceLevel = { $in: query.experienceLevel };
    }
    
    if (query.availability && query.availability.length > 0) {
      dbQuery.availability = { $in: query.availability };
    }
    
    // 📍 Location
    if (query.location) {
      dbQuery.location = { $regex: query.location, $options: 'i' };
    }
    
    if (query.timezone) {
      dbQuery.timezone = query.timezone;
    }
    
    // 📊 Skills
    if (query.skills && query.skills.length > 0) {
      dbQuery.skills = { $in: query.skills };
    }
    
    if (query.hasSkills !== undefined) {
      if (query.hasSkills) {
        dbQuery.skills = { $exists: true, $ne: [] };
      } else {
        dbQuery.$or = [
          { skills: { $exists: false } },
          { skills: [] },
          { skills: { $size: 0 } }
        ];
      }
    }
    
    // 📊 Performance
    if (query.minWorkload !== undefined || query.maxWorkload !== undefined) {
      dbQuery.workload = {};
      if (query.minWorkload !== undefined) dbQuery.workload.$gte = query.minWorkload;
      if (query.maxWorkload !== undefined) dbQuery.workload.$lte = query.maxWorkload;
    }
    
    // 📅 Date Filters
    if (query.createdAfter || query.createdBefore) {
      dbQuery.createdAt = {};
      if (query.createdAfter) dbQuery.createdAt.$gte = new Date(query.createdAfter);
      if (query.createdBefore) dbQuery.createdAt.$lte = new Date(query.createdBefore);
    }
    
    if (query.lastActiveAfter || query.lastActiveBefore) {
      dbQuery.lastActiveAt = {};
      if (query.lastActiveAfter) dbQuery.lastActiveAt.$gte = new Date(query.lastActiveAfter);
      if (query.lastActiveBefore) dbQuery.lastActiveAt.$lte = new Date(query.lastActiveBefore);
    }
    
    // 📊 Status
    if (query.isActive !== undefined) {
      dbQuery.isActive = query.isActive;
    }
    
    if (query.isOnline !== undefined) {
      dbQuery.isOnline = query.isOnline;
    }
    
    if (query.onboardingStatus && query.onboardingStatus.length > 0) {
      dbQuery.onboardingStatus = { $in: query.onboardingStatus };
    }
    
    // 🔍 Search
    if (query.search) {
      const searchConditions = query.searchIn.map((field: string) => ({
        [field]: { $regex: query.search, $options: 'i' }
      }));
      
      dbQuery.$or = searchConditions;
    }
    
    // 🎯 Special Queries
    if (query.availableForAssignment) {
      dbQuery.$and = [
        { isActive: true },
        { availability: { $in: ['full_time', 'part_time'] } },
        { workload: { $lt: 100 } }
      ];
    }
    
    if (query.hasCertifications) {
      dbQuery.certifications = { $exists: true, $ne: [] };
    }
    
    return dbQuery;
  }
  
  private canEditUser(user: any, session: any): boolean {
    return (
      user.email === session.user.email ||
      hasPermission(session.user.role, 'edit_all_users') ||
      (hasPermission(session.user.role, 'edit_team_users') && user.teamId === session.user.teamId)
    );
  }
  
  private canDeactivateUser(user: any, session: any): boolean {
    return (
      hasPermission(session.user.role, 'deactivate_users') &&
      user.email !== session.user.email // Cannot deactivate yourself
    );
  }
  
  private async logActivity(activity: any): Promise<void> {
    const activityCollection = await getCollection('activity_logs');
    await activityCollection.insertOne({
      ...activity,
      timestamp: new Date(),
      id: new ObjectId().toString()
    });
  }
  
  private async sendWelcomeEmail(user: any): Promise<void> {
    // Implementation would integrate with email service
    console.log(`Welcome email sent to ${user.email}`);
  }
  
  private getUserChanges(oldUser: any, newUserData: any): any {
    const changes: any = {};
    
    for (const [key, value] of Object.entries(newUserData)) {
      if (oldUser[key] !== value) {
        changes[key] = {
          from: oldUser[key],
          to: value
        };
      }
    }
    
    return changes;
  }
  
  private async calculateUsersAnalytics(query: any, groupBy?: string): Promise<any> {
    const usersCollection = await getCollection('users');
    
    if (!groupBy) {
      const stats = await usersCollection.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
            onlineUsers: { $sum: { $cond: [{ $eq: ['$isOnline', true] }, 1, 0] } },
            averageProfileCompletion: { $avg: '$profileCompletion' },
            usersByRole: { $push: '$role' },
            usersByDepartment: { $push: '$department' }
          }
        }
      ]).toArray();
      
      return stats[0] || {};
    }
    
    // Grouped analytics
    const groupPipeline = [
      { $match: query },
      {
        $group: {
          _id: `$${groupBy}`,
          count: { $sum: 1 },
          activeCount: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          avgProfileCompletion: { $avg: '$profileCompletion' }
        }
      },
      { $sort: { count: -1 } }
    ];
    
    return await usersCollection.aggregate(groupPipeline).toArray();
  }
  
  private async updateTeamCounts(teamId: string): Promise<void> {
    const usersCollection = await getCollection('users');
    const teamsCollection = await getCollection('teams');
    
    const teamMemberCount = await usersCollection.countDocuments({
      teamId,
      isActive: true
    });
    
    await teamsCollection.updateOne(
      { _id: new ObjectId(teamId) },
      {
        $set: {
          memberCount: teamMemberCount,
          updatedAt: new Date()
        }
      }
    );
  }
  
  private async updateManagerReports(managerId: string): Promise<void> {
    const usersCollection = await getCollection('users');
    
    const reportCount = await usersCollection.countDocuments({
      managerId,
      isActive: true
    });
    
    await usersCollection.updateOne(
      { email: managerId },
      {
        $set: {
          reportCount,
          updatedAt: new Date()
        }
      }
    );
  }
}

// 🚀 API Handlers
const enhancedUserManager = new EnhancedUserManager();

// 👥 GET - Enhanced Users
export const GET = createEnhancedAPI(
  async (request: NextRequest, context: any, enhancers) => {
    const { searchParams } = new URL(request.url);
    const query = userQuerySchemaV3.parse(Object.fromEntries(searchParams));
    
    const result = await enhancedUserManager.getUsersV3(query, enhancers.session, enhancers);
    
    return NextResponse.json(
      createSuccessResponse(
        result,
        "Users retrieved successfully",
        {
          query,
          pagination: result.pagination,
          version: 'v3.0'
        }
      )
    );
  },
  {
    requireAuth: true,
    rateLimitTier: 'default',
    cacheKey: (request) => `users:${request.url}`,
    cacheTTL: API_CONFIG.CACHE.user.ttl,
    enableMetrics: true
  }
);

// 👤 POST - Create Enhanced User
export const POST = createEnhancedAPI(
  async (request: NextRequest, context: any, enhancers) => {
    const userData = createUserSchemaV3.parse(enhancers.validatedInput);
    
    const user = await enhancedUserManager.createUserV3(userData, enhancers.session, enhancers);
    
    return NextResponse.json(
      createCreatedResponse(
        user,
        "User created successfully",
        {
          userId: user._id.toString(),
          userNumber: user.userNumber,
          version: 'v3.0'
        }
      ),
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    rateLimitTier: 'default',
    validateInput: createUserSchemaV3,
    enableMetrics: true
  }
);

// 📝 PUT - Update Enhanced User
export const PUT = createEnhancedAPI(
  async (request: NextRequest, context: any, enhancers) => {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        createBadRequestResponse("User ID is required"),
        { status: 400 }
      );
    }
    
    const updateData = updateUserSchemaV3.parse(enhancers.validatedInput);
    
    const user = await enhancedUserManager.updateUserV3(userId, updateData, enhancers.session, enhancers);
    
    return NextResponse.json(
      createSuccessResponse(
        user,
        "User updated successfully",
        {
          userId: user._id.toString(),
          profileCompletion: user.profileCompletion,
          version: 'v3.0'
        }
      )
    );
  },
  {
    requireAuth: true,
    rateLimitTier: 'default',
    validateInput: updateUserSchemaV3,
    enableMetrics: true
  }
);

// 🗑️ DELETE - Deactivate Enhanced User
export const DELETE = createEnhancedAPI(
  async (request: NextRequest, context: any, enhancers) => {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        createBadRequestResponse("User ID is required"),
        { status: 400 }
      );
    }
    
    await enhancedUserManager.deactivateUserV3(userId, enhancers.session, enhancers);
    
    return NextResponse.json(
      createSuccessResponse(
        null,
        "User deactivated successfully",
        {
          userId,
          version: 'v3.0'
        }
      )
    );
  },
  {
    requireAuth: true,
    rateLimitTier: 'default',
    enableMetrics: true
  }
);
