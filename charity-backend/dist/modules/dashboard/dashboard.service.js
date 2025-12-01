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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const enhanced_project_schema_1 = require("../../db/schemas/enhanced-project.schema");
const enhanced_user_schema_1 = require("../../db/schemas/enhanced-user.schema");
const donation_schema_1 = require("../../db/schemas/donation.schema");
const task_schema_1 = require("../../db/schemas/task.schema");
let DashboardService = class DashboardService {
    constructor(projectModel, userModel, donationModel, taskModel) {
        this.projectModel = projectModel;
        this.userModel = userModel;
        this.donationModel = donationModel;
        this.taskModel = taskModel;
    }
    async getDashboardStats(userId) {
        var _a, _b;
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const [totalProjects, activeProjects, completedProjects, totalUsers, activeUsers, totalDonations, monthlyDonations, yearlyDonations, totalTasks, completedTasks, pendingTasks, recentProjects, topDonors, recentActivity,] = await Promise.all([
                this.projectModel.countDocuments(),
                this.projectModel.countDocuments({ status: 'ACTIVE' }),
                this.projectModel.countDocuments({ status: 'COMPLETED' }),
                this.userModel.countDocuments(),
                this.userModel.countDocuments({ isActive: true }),
                this.donationModel.countDocuments(),
                this.donationModel.aggregate([
                    { $match: { createdAt: { $gte: startOfMonth } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
                this.donationModel.aggregate([
                    { $match: { createdAt: { $gte: startOfYear } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
                this.taskModel.countDocuments(),
                this.taskModel.countDocuments({ status: 'completed' }),
                this.taskModel.countDocuments({ status: 'pending' }),
                this.projectModel.find().sort({ createdAt: -1 }).limit(5).select('title status createdAt currentAmount targetAmount'),
                this.donationModel.aggregate([
                    { $group: { _id: '$userId', total: { $sum: '$amount' }, count: { $sum: 1 } } },
                    { $sort: { total: -1 } },
                    { $limit: 5 },
                    { $lookup: { from: 'enhancedusers', localField: '_id', foreignField: '_id', as: 'user' } },
                    { $unwind: '$user' },
                    { $project: { 'user.name': 1, 'user.email': 1, total: 1, count: 1 } },
                ]),
                this.projectModel.find().sort({ updatedAt: -1 }).limit(10).select('title updatedAt'),
            ]);
            const monthlyTotal = ((_a = monthlyDonations[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
            const yearlyTotal = ((_b = yearlyDonations[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
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
        }
        catch (error) {
            console.error('Failed to get dashboard stats:', error);
            throw error;
        }
    }
    async getUserDashboard(userId) {
        try {
            const [userProjects, userDonations, userTasks, userStats, recommendedProjects,] = await Promise.all([
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
            const totalProjectsCreated = userProjects.filter(p => { var _a; return ((_a = p.createdBy) === null || _a === void 0 ? void 0 : _a.toString()) === userId; }).length;
            const totalTasksCompleted = userTasks.filter(t => t.status === 'completed').length;
            return {
                user: userStats,
                stats: {
                    projectsCreated: totalProjectsCreated,
                    projectsVolunteered: userProjects.filter(p => p.volunteers.includes(new mongoose_2.Types.ObjectId(userId))).length,
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
        }
        catch (error) {
            console.error('Failed to get user dashboard:', error);
            throw error;
        }
    }
    async getProjectAnalytics(projectId) {
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
            const uniqueDonors = new Set(donations.map(d => d.userId)).size;
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
                donations: donations.slice(0, 20),
                tasks: tasks.slice(0, 20),
            };
        }
        catch (error) {
            console.error('Failed to get project analytics:', error);
            throw error;
        }
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(enhanced_project_schema_1.EnhancedProject.name)),
    __param(1, (0, mongoose_1.InjectModel)(enhanced_user_schema_1.EnhancedUser.name)),
    __param(2, (0, mongoose_1.InjectModel)(donation_schema_1.Donation.name)),
    __param(3, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map