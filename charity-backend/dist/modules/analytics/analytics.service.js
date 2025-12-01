"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const enhanced_project_schema_1 = require("../../db/schemas/enhanced-project.schema");
const enhanced_user_schema_1 = require("../../db/schemas/enhanced-user.schema");
let AnalyticsService = class AnalyticsService {
    constructor(visitModel, projectModel, userModel) {
        this.visitModel = visitModel;
        this.projectModel = projectModel;
        this.userModel = userModel;
    }
    async trackVisit(visitData) {
        try {
            const project = await this.projectModel.findById(visitData.projectId);
            if (!project) {
                throw new Error('Project not found');
            }
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
            await this.projectModel.findByIdAndUpdate(visitData.projectId, {
                $inc: { 'analytics.totalViews': 1 },
                $set: { 'analytics.lastViewed': new Date() },
            });
            console.log(`📊 Visit tracked: ${visitData.projectId} (${visitData.userType})`);
            return { success: true, visitId: visit._id };
        }
        catch (error) {
            console.error('Failed to track visit:', error);
            throw error;
        }
    }
    async getProjectAnalytics(projectId, timeframe = 'week') {
        try {
            const now = new Date();
            let startDate;
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
                        projectId: new mongoose_2.Types.ObjectId(projectId),
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
        }
        catch (error) {
            console.error('Failed to get project analytics:', error);
            throw error;
        }
    }
    async getUserVisitHistory(userId, limit = 50) {
        try {
            const visits = await this.visitModel
                .find({ userId })
                .populate('projectId', 'title slug thumbnail')
                .sort({ timestamp: -1 })
                .limit(limit);
            return visits;
        }
        catch (error) {
            console.error('Failed to get user visit history:', error);
            throw error;
        }
    }
    async getDashboardAnalytics() {
        try {
            const [totalVisits, uniqueUsers, popularProjects, recentActivity,] = await Promise.all([
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
        }
        catch (error) {
            console.error('Failed to get dashboard analytics:', error);
            throw error;
        }
    }
    async getAvgSessionDuration() {
        var _a;
        try {
            const result = await this.visitModel.aggregate([
                { $group: { _id: null, avgDuration: { $avg: '$duration' } } },
            ]);
            return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.avgDuration) || 0;
        }
        catch (error) {
            return 0;
        }
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Visit')),
    __param(1, (0, mongoose_1.InjectModel)(enhanced_project_schema_1.EnhancedProject.name)),
    __param(2, (0, mongoose_1.InjectModel)(enhanced_user_schema_1.EnhancedUser.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map