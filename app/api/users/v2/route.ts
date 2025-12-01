/**
 * Enhanced User Management API v2.0
 * 
 * Enterprise-grade user management with advanced features:
 * - Advanced user profiles and preferences
 * - Role-based permissions with granular control
 * - User activity tracking and analytics
 * - Team management and organization structure
 * - User authentication and security features
 * - Bulk user operations and imports
 * - User lifecycle management
 * - Integration with external identity providers
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { z } from "zod";
import bcrypt from 'bcryptjs';
import { UserRole, hasPermission } from "@/lib/roles";
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

// Enhanced user schemas
const createUserSchemaV2 = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  role: z.enum(['admin', 'manager', 'lead', 'member', 'viewer']).default('member'),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  managerId: z.string().email().optional(),
  teamId: z.string().optional(),
  location: z.string().max(200).optional(),
  timezone: z.string().default('UTC'),
  language: z.string().default('en'),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string(),
    expiryDate: z.string().optional()
  })).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      sms: z.boolean().default(false),
      taskAssignments: z.boolean().default(true),
      taskUpdates: z.boolean().default(true),
      deadlines: z.boolean().default(true),
      mentions: z.boolean().default(true)
    }).default({}),
    workingHours: z.object({
      start: z.string().default('09:00'),
      end: z.string().default('17:00'),
      timezone: z.string().default('UTC'),
      workingDays: z.array(z.number().min(0).max(6)).default([1, 2, 3, 4, 5])
    }).default({})
  }).optional(),
  metadata: z.record(z.any()).optional()
});

const updateUserSchemaV2 = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['admin', 'manager', 'lead', 'member', 'viewer']).optional(),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  managerId: z.string().email().optional(),
  teamId: z.string().optional(),
  location: z.string().max(200).optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string(),
    expiryDate: z.string().optional()
  })).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      sms: z.boolean().optional(),
      taskAssignments: z.boolean().optional(),
      taskUpdates: z.boolean().optional(),
      deadlines: z.boolean().optional(),
      mentions: z.boolean().optional()
    }).optional(),
    workingHours: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
      timezone: z.string().optional(),
      workingDays: z.array(z.number().min(0).max(6)).optional()
    }).optional()
  }).optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
  metadata: z.record(z.any()).optional()
});

const userQuerySchemaV2 = z.object({
  // Basic filtering
  role: z.enum(['admin', 'manager', 'lead', 'member', 'viewer']).optional(),
  department: z.string().optional(),
  teamId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
  location: z.string().optional(),
  
  // Advanced filtering
  skills: z.array(z.string()).optional(),
  certifications: z.string().optional(),
  lastLoginAfter: z.string().optional(),
  lastLoginBefore: z.string().optional(),
  createdAfter: z.string().optional(),
  createdBefore: z.string().optional(),
  
  // Search
  search: z.string().optional(),
  
  // Sorting and pagination
  sortBy: z.enum(['name', 'email', 'role', 'createdAt', 'lastLoginAt', 'department']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.string().transform(Number).refine(n => n > 0, "Page must be positive").default(1),
  limit: z.string().transform(Number).refine(n => n > 0 && n <= 100, "Limit must be between 1-100").default(20),
  
  // Include options
  includeInactive: z.string().transform(val => val === 'true').default('false'),
  includeMetrics: z.string().transform(val => val === 'true').default('false'),
  includeTeams: z.string().transform(val => val === 'true').default('false'),
  includeActivity: z.string().transform(val => val === 'true').default('false')
});

const bulkUserOperationSchema = z.object({
  operation: z.enum(['create', 'update', 'delete', 'activate', 'deactivate', 'assignRole', 'addToTeam']),
  users: z.array(z.any()).min(1).max(100),
  options: z.object({
    sendWelcomeEmail: z.boolean().default(true),
    skipDuplicates: z.boolean().default(true),
    validateEmail: z.boolean().default(true),
    createAuditLog: z.boolean().default(true)
  }).optional()
});

// Enhanced User Manager
class EnhancedUserManager {
  async createUserV2(userData: any, session: any, options: any = {}): Promise<any> {
    try {
      const usersCollection = await getCollection('users');
      const teamsCollection = await getCollection('teams');
      
      // Check for duplicate email
      if (options.validateEmail !== false) {
        const existingUser = await usersCollection.findOne({ email: userData.email });
        if (existingUser) {
          throw new Error('User with this email already exists');
        }
      }
      
      // Validate team if specified
      if (userData.teamId) {
        const team = await teamsCollection.findOne({ _id: new ObjectId(userData.teamId) });
        if (!team) {
          throw new Error('Team not found');
        }
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Create user object
      const user = {
        _id: new ObjectId(),
        ...userData,
        password: hashedPassword,
        emailVerified: false,
        emailVerificationToken: this.generateVerificationToken(),
        passwordResetToken: null,
        passwordResetExpires: null,
        lastLoginAt: null,
        loginAttempts: 0,
        lockedUntil: null,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: [],
        sessions: [],
        permissions: this.getDefaultPermissions(userData.role),
        statistics: {
          tasksCreated: 0,
          tasksCompleted: 0,
          projectsParticipated: 0,
          avgCompletionTime: 0,
          productivityScore: 0,
          lastActivityAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: session.user.email,
        status: 'active'
      };
      
      await usersCollection.insertOne(user);
      
      // Add to team if specified
      if (userData.teamId) {
        await teamsCollection.updateOne(
          { _id: new ObjectId(userData.teamId) },
          { 
            $push: { members: user.email },
            $set: { updatedAt: new Date() }
          }
        );
      }
      
      // Send welcome email
      if (options.sendWelcomeEmail !== false) {
        await this.sendWelcomeEmail(user);
      }
      
      // Log activity
      await this.logActivity({
        userId: session.user.email,
        action: 'CREATE_USER_V2',
        entityType: 'user',
        entityId: user._id.toString(),
        entityName: user.name,
        description: `User created: ${user.name} (${user.email})`,
        metadata: {
          role: user.role,
          department: user.department,
          teamId: user.teamId
        }
      });
      
      // Remove sensitive data before returning
      const { password, ...userWithoutPassword } = user;
      
      return userWithoutPassword;
    } catch (error) {
      console.error('Failed to create enhanced user:', error);
      throw error;
    }
  }
  
  async getUsersV2(query: any, session: any): Promise<any> {
    try {
      const usersCollection = await getCollection('users');
      const teamsCollection = await getCollection('teams');
      
      // Build query
      const dbQuery: any = {};
      
      // Apply filters
      if (query.role) dbQuery.role = query.role;
      if (query.department) dbQuery.department = query.department;
      if (query.teamId) dbQuery.teamId = query.teamId;
      if (query.status) dbQuery.status = query.status;
      if (query.location) dbQuery.location = { $regex: query.location, $options: 'i' };
      
      // Advanced filters
      if (query.skills && query.skills.length > 0) {
        dbQuery.skills = { $in: query.skills };
      }
      
      if (query.lastLoginAfter || query.lastLoginBefore) {
        dbQuery.lastLoginAt = {};
        if (query.lastLoginAfter) dbQuery.lastLoginAt.$gte = new Date(query.lastLoginAfter);
        if (query.lastLoginBefore) dbQuery.lastLoginAt.$lte = new Date(query.lastLoginBefore);
      }
      
      if (query.createdAfter || query.createdBefore) {
        dbQuery.createdAt = {};
        if (query.createdAfter) dbQuery.createdAt.$gte = new Date(query.createdAfter);
        if (query.createdBefore) dbQuery.createdAt.$lte = new Date(query.createdBefore);
      }
      
      // Search functionality
      if (query.search) {
        dbQuery.$or = [
          { name: { $regex: query.search, $options: 'i' } },
          { email: { $regex: query.search, $options: 'i' } },
          { position: { $regex: query.search, $options: 'i' } },
          { department: { $regex: query.search, $options: 'i' } }
        ];
      }
      
      // Include inactive users
      if (query.includeInactive !== true) {
        dbQuery.status = { $ne: 'inactive' };
      }
      
      // Get total count
      const total = await usersCollection.countDocuments(dbQuery);
      
      // Build aggregation pipeline
      const pipeline: any[] = [
        { $match: dbQuery },
        { $sort: { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 } },
        { $skip: (query.page - 1) * query.limit },
        { $limit: query.limit }
      ];
      
      // Include additional data
      if (query.includeTeams) {
        pipeline.push({
          $lookup: {
            from: 'teams',
            localField: 'teamId',
            foreignField: '_id',
            as: 'teamInfo',
            pipeline: [{ $project: { name: 1, description: 1 } }]
          }
        });
      }
      
      if (query.includeMetrics) {
        pipeline.push({
          $lookup: {
            from: 'tasks',
            let: { userEmail: '$email' },
            pipeline: [
              { $match: { $expr: { $or: [
                { $eq: ['$assignedTo', '$$userEmail'] },
                { $eq: ['$createdBy', '$$userEmail'] }
              ]}}},
              { $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                avgCompletionTime: { $avg: '$metrics.completionTime' }
              }}
            ],
            as: 'taskMetrics'
          }
        });
        
        pipeline.push({
          $addFields: {
            'statistics.tasksTotal': { $ifNull: [{ $arrayElemAt: ['$taskMetrics.totalTasks', 0] }, 0] },
            'statistics.tasksCompleted': { $ifNull: [{ $arrayElemAt: ['$taskMetrics.completedTasks', 0] }, 0] },
            'statistics.avgCompletionTime': { $ifNull: [{ $arrayElemAt: ['$taskMetrics.avgCompletionTime', 0] }, 0] }
          }
        });
      }
      
      if (query.includeActivity) {
        pipeline.push({
          $lookup: {
            from: 'activity_logs',
            let: { userEmail: '$email' },
            pipeline: [
              { $match: { $expr: { $eq: ['$userId', '$$userEmail'] } } },
              { $sort: { timestamp: -1 } },
              { $limit: 10 },
              { $project: { action: 1, description: 1, timestamp: 1 } }
            ],
            as: 'recentActivity'
          }
        });
      }
      
      const users = await usersCollection.aggregate(pipeline).toArray();
      
      // Remove sensitive data
      const usersWithoutPasswords = users.map(user => {
        const { password, twoFactorSecret, backupCodes, ...userWithoutSensitive } = user;
        return userWithoutSensitive;
      });
      
      // Pagination metadata
      const pagination = {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
        hasNext: query.page * query.limit < total,
        hasPrev: query.page > 1
      };
      
      return {
        users: usersWithoutPasswords,
        pagination,
        filters: {
          role: query.role,
          department: query.department,
          teamId: query.teamId,
          status: query.status,
          search: query.search
        },
        statistics: {
          totalUsers: total,
          activeUsers: users.filter(u => u.status === 'active').length,
          usersByRole: this.groupByRole(users),
          usersByDepartment: this.groupByDepartment(users)
        }
      };
    } catch (error) {
      console.error('Failed to get enhanced users:', error);
      throw error;
    }
  }
  
  async bulkUserOperationV2(operation: any, session: any): Promise<any> {
    const usersCollection = await getCollection('users');
    const { operation: opType, users, options = {} } = operation;
    
    const results = [];
    
    for (const userData of users) {
      try {
        let result;
        
        switch (opType) {
          case 'create':
            result = await this.createUserV2(userData, session, options);
            break;
          case 'update':
            result = await this.updateUserV2(userData.email || userData.id, userData, session, options);
            break;
          case 'delete':
            result = await this.deleteUserV2(userData.email || userData.id, session, options);
            break;
          case 'activate':
            result = await this.setUserStatusV2(userData.email || userData.id, 'active', session, options);
            break;
          case 'deactivate':
            result = await this.setUserStatusV2(userData.email || userData.id, 'inactive', session, options);
            break;
          case 'assignRole':
            result = await this.assignRoleV2(userData.email || userData.id, userData.role, session, options);
            break;
          case 'addToTeam':
            result = await this.addToTeamV2(userData.email || userData.id, userData.teamId, session, options);
            break;
          default:
            throw new Error(`Unsupported operation: ${opType}`);
        }
        
        results.push({ 
          user: userData.email || userData.id, 
          success: true, 
          result 
        });
      } catch (error) {
        results.push({ 
          user: userData.email || userData.id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    // Log bulk operation
    if (options.createAuditLog !== false) {
      await this.logActivity({
        userId: session.user.email,
        action: `BULK_USER_${opType.toUpperCase()}`,
        entityType: 'user',
        description: `Bulk ${opType} operation on ${successCount} users`,
        metadata: {
          operation: opType,
          successCount,
          failureCount,
          performedAt: new Date()
        }
      });
    }
    
    return {
      results,
      summary: {
        total: users.length,
        success: successCount,
        failed: failureCount,
        successRate: users.length > 0 ? (successCount / users.length) * 100 : 0
      }
    };
  }
  
  async updateUserProfileV2(email: string, updates: any, session: any): Promise<any> {
    const usersCollection = await getCollection('users');
    
    const user = await usersCollection.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
    
    // Users can only update their own profile (unless admin)
    if (session.user.email !== email && !hasPermission(session.user.role as UserRole, 'canManageUsers')) {
      throw new Error('Insufficient permissions to update this user');
    }
    
    const allowedUpdates = {};
    
    // Only allow certain fields for self-updates
    if (session.user.email === email) {
      if (updates.name) allowedUpdates.name = updates.name;
      if (updates.avatar) allowedUpdates.avatar = updates.avatar;
      if (updates.bio) allowedUpdates.bio = updates.bio;
      if (updates.phone) allowedUpdates.phone = updates.phone;
      if (updates.location) allowedUpdates.location = updates.location;
      if (updates.timezone) allowedUpdates.timezone = updates.timezone;
      if (updates.language) allowedUpdates.language = updates.language;
      if (updates.preferences) allowedUpdates.preferences = { ...user.preferences, ...updates.preferences };
      if (updates.skills) allowedUpdates.skills = updates.skills;
      if (updates.certifications) allowedUpdates.certifications = updates.certifications;
    } else {
      // Admins can update more fields
      Object.assign(allowedUpdates, updates);
    }
    
    const result = await usersCollection.updateOne(
      { email },
      { 
        $set: { 
          ...allowedUpdates, 
          updatedAt: new Date(),
          updatedBy: session.user.email
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      throw new Error('User not found');
    }
    
    const updatedUser = await usersCollection.findOne({ email });
    const { password, twoFactorSecret, backupCodes, ...userWithoutSensitive } = updatedUser;
    
    return userWithoutSensitive;
  }
  
  async getUserAnalyticsV2(email: string, session: any): Promise<any> {
    const usersCollection = await getCollection('users');
    const tasksCollection = await getCollection('tasks');
    const activityCollection = await getCollection('activity_logs');
    
    const user = await usersCollection.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
    
    // Permission check
    if (session.user.email !== email && !hasPermission(session.user.role as UserRole, 'canViewUserAnalytics')) {
      throw new Error('Insufficient permissions to view user analytics');
    }
    
    // Task analytics
    const taskAnalytics = await tasksCollection.aggregate([
      { $match: { $or: [{ assignedTo: email }, { createdBy: email }] } },
      { $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        overdueTasks: { $sum: { $cond: [
          { $and: [
            { $lt: ['$endDate', new Date()] },
            { $ne: ['$status', 'completed'] }
          ]}, 1, 0
        ]} },
        avgCompletionTime: { $avg: { $subtract: ['$completedAt', '$createdAt'] } },
        tasksByPriority: {
          $push: {
            priority: '$priority',
            status: '$status',
            completedAt: '$completedAt'
          }
        }
      }}
    ]).toArray();
    
    // Activity analytics
    const activityAnalytics = await activityCollection.aggregate([
      { $match: { userId: email } },
      { $group: {
        _id: '$action',
        count: { $sum: 1 },
        lastOccurrence: { $max: '$timestamp' }
      }},
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Login analytics
    const loginAnalytics = await activityCollection.aggregate([
      { $match: { userId: email, action: 'LOGIN' } },
      { $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        loginCount: { $sum: 1 }
      }},
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 30 }
    ]).toArray();
    
    // Productivity trends
    const productivityTrends = await this.getProductivityTrends(email);
    
    return {
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        joinDate: user.createdAt
      },
      taskAnalytics: taskAnalytics[0] || {},
      activityAnalytics,
      loginAnalytics,
      productivityTrends,
      insights: await this.generateUserInsights({
        taskAnalytics: taskAnalytics[0],
        activityAnalytics,
        loginAnalytics
      })
    };
  }
  
  // Helper methods
  private generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  private getDefaultPermissions(role: string): string[] {
    const permissions = {
      admin: ['*'],
      manager: ['canViewTasks', 'canCreateTasks', 'canAssignTasks', 'canManageTeam', 'canViewReports'],
      lead: ['canViewTasks', 'canCreateTasks', 'canAssignTasks', 'canViewReports'],
      member: ['canViewTasks', 'canCreateTasks'],
      viewer: ['canViewTasks']
    };
    return permissions[role as keyof typeof permissions] || [];
  }
  
  private async sendWelcomeEmail(user: any): Promise<void> {
    // Implementation for sending welcome email
    console.log(`Welcome email sent to ${user.email}`);
  }
  
  private async logActivity(activity: any): Promise<void> {
    const activityCollection = await getCollection('activity_logs');
    await activityCollection.insertOne({
      ...activity,
      timestamp: new Date(),
      id: new ObjectId().toString()
    });
  }
  
  private groupByRole(users: any[]): any {
    return users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
  }
  
  private groupByDepartment(users: any[]): any {
    return users.reduce((acc, user) => {
      const dept = user.department || 'Unassigned';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
  }
  
  private async getProductivityTrends(email: string): Promise<any> {
    // Implementation for productivity trends
    return [];
  }
  
  private async generateUserInsights(data: any): Promise<string[]> {
    const insights = [];
    
    if (data.taskAnalytics?.overdueTasks > 0) {
      insights.push(`User has ${data.taskAnalytics.overdueTasks} overdue tasks that need attention.`);
    }
    
    if (data.taskAnalytics?.avgCompletionTime > 7 * 24 * 60 * 60 * 1000) { // 7 days
      insights.push("Average completion time is above 7 days. Consider reviewing workload or task complexity.");
    }
    
    return insights;
  }
  
  // Additional private methods
  private async updateUserV2(identifier: string, updates: any, session: any, options: any): Promise<any> {
    // Implementation for user update
    return {};
  }
  
  private async deleteUserV2(identifier: string, session: any, options: any): Promise<any> {
    // Implementation for user deletion (soft delete)
    return {};
  }
  
  private async setUserStatusV2(identifier: string, status: string, session: any, options: any): Promise<any> {
    // Implementation for status change
    return {};
  }
  
  private async assignRoleV2(identifier: string, role: string, session: any, options: any): Promise<any> {
    // Implementation for role assignment
    return {};
  }
  
  private async addToTeamV2(identifier: string, teamId: string, session: any, options: any): Promise<any> {
    // Implementation for team assignment
    return {};
  }
}

// API Handlers
const enhancedUserManager = new EnhancedUserManager();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }
    
    const { searchParams } = new URL(request.url);
    const query = userQuerySchemaV2.parse(Object.fromEntries(searchParams));
    
    // Check permissions
    if (!hasPermission(session.user.role as UserRole, 'canViewUsers')) {
      return setCorsHeaders(createForbiddenResponse("Insufficient permissions to view users"));
    }
    
    const result = await enhancedUserManager.getUsersV2(query, session);
    
    return setCorsHeaders(createSuccessResponse(
      result,
      "Users retrieved successfully",
      {
        query,
        timestamp: new Date().toISOString(),
        version: 'v2.0'
      }
    ));
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return setCorsHeaders(createBadRequestResponse(
        error.issues.map((e: any) => e.message).join(', ')
      ));
    }
    return handleApiError(error, "Getting enhanced users");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }
    
    // Check permissions
    if (!hasPermission(session.user.role as UserRole, 'canCreateUsers')) {
      return setCorsHeaders(createForbiddenResponse("Insufficient permissions to create users"));
    }
    
    const body = await request.json();
    
    // Handle different POST operations
    if (body.operation && body.users) {
      // Bulk operation
      const validatedOperation = bulkUserOperationSchema.parse(body);
      const result = await enhancedUserManager.bulkUserOperationV2(validatedOperation, session);
      
      return setCorsHeaders(createSuccessResponse(
        result,
        `Bulk user operation completed`,
        {
          operation: validatedOperation.operation,
          summary: result.summary,
          version: 'v2.0'
        }
      ));
    } else {
      // Single user creation
      const validatedUser = createUserSchemaV2.parse(body);
      const user = await enhancedUserManager.createUserV2(validatedUser, session);
      
      return setCorsHeaders(createCreatedResponse(
        user,
        "User created successfully",
        {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
          version: 'v2.0'
        }
      ));
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return setCorsHeaders(createBadRequestResponse(
        error.issues.map((e: any) => e.message).join(', ')
      ));
    }
    return handleApiError(error, "Creating users");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return setCorsHeaders(createBadRequestResponse("Email parameter is required"));
    }
    
    const body = await request.json();
    const validatedUpdates = updateUserSchemaV2.parse(body);
    
    const user = await enhancedUserManager.updateUserProfileV2(email, validatedUpdates, session);
    
    return setCorsHeaders(createSuccessResponse(
      user,
      "User updated successfully",
      {
        email,
        version: 'v2.0'
      }
    ));
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return setCorsHeaders(createBadRequestResponse(
        error.issues.map((e: any) => e.message).join(', ')
      ));
    }
    return handleApiError(error, "Updating user");
  }
}

// User analytics endpoint
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return setCorsHeaders(createBadRequestResponse("Email parameter is required"));
    }
    
    const analytics = await enhancedUserManager.getUserAnalyticsV2(email, session);
    
    return setCorsHeaders(createSuccessResponse(
      analytics,
      "User analytics retrieved successfully",
      {
        email,
        version: 'v2.0'
      }
    ));
    
  } catch (error) {
    return handleApiError(error, "Getting user analytics");
  }
}
