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
exports.EnhancedProjectService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const enhanced_project_schema_1 = require("../../db/schemas/enhanced-project.schema");
const donation_schema_1 = require("../../db/schemas/donation.schema");
const enhanced_user_schema_1 = require("../../db/schemas/enhanced-user.schema");
const role_enum_1 = require("../../common/enums/role.enum");
const enhanced_project_schema_2 = require("../../db/schemas/enhanced-project.schema");
let EnhancedProjectService = class EnhancedProjectService {
    constructor(projectModel, userModel, donationModel) {
        this.projectModel = projectModel;
        this.userModel = userModel;
        this.donationModel = donationModel;
    }
    async create(createProjectDto, createdBy) {
        var _a;
        const slug = await this.generateUniqueSlug(createProjectDto.slug || ((_a = createProjectDto.contents[0]) === null || _a === void 0 ? void 0 : _a.title));
        if (createProjectDto.projectManager) {
            const manager = await this.userModel.findById(createProjectDto.projectManager);
            if (!manager) {
                throw new common_1.BadRequestException('Project manager not found');
            }
        }
        if (new Date(createProjectDto.startDate) >= new Date(createProjectDto.endDate)) {
            throw new common_1.BadRequestException('End date must be after start date');
        }
        const project = new this.projectModel({
            ...createProjectDto,
            slug,
            createdBy: new mongoose_2.Types.ObjectId(createdBy),
            updatedBy: new mongoose_2.Types.ObjectId(createdBy),
        });
        project.activityLog.push({
            action: 'PROJECT_CREATED',
            description: 'Project was created',
            userId: new mongoose_2.Types.ObjectId(createdBy),
            timestamp: new Date(),
        });
        return project.save();
    }
    async findAll(filterDto, user) {
        const { page = 1, limit = 10, category, status, featured, search, sortBy = 'createdAt', sortOrder = 'desc', city, country, priority, projectManager, } = filterDto;
        const query = {};
        if (category)
            query.category = category;
        if (status)
            query.status = status;
        if (featured !== undefined)
            query.isFeatured = featured;
        if (city)
            query.city = new RegExp(city, 'i');
        if (country)
            query.country = new RegExp(country, 'i');
        if (priority)
            query.priority = priority;
        if (projectManager)
            query.projectManager = new mongoose_2.Types.ObjectId(projectManager);
        if (search) {
            query.$or = [
                { 'contents.title': new RegExp(search, 'i') },
                { 'contents.description': new RegExp(search, 'i') },
                { location: new RegExp(search, 'i') },
                { tags: { $in: [new RegExp(search, 'i')] } },
            ];
        }
        if (user.role !== role_enum_1.Role.ADMIN) {
            query.isVisible = true;
        }
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const [projects, total] = await Promise.all([
            this.projectModel
                .find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('projectManager', 'name email avatar')
                .populate('teamMembers', 'name email avatar')
                .lean(),
            this.projectModel.countDocuments(query),
        ]);
        const projectsWithStats = await Promise.all(projects.map(async (project) => {
            const [donationStats, volunteerCount] = await Promise.all([
                this.getDonationStats(project._id.toString()),
                this.getVolunteerCount(project._id.toString()),
            ]);
            return {
                ...project,
                donationStats,
                volunteerCount,
                progressPercentage: this.calculateProgress(project),
                daysRemaining: this.calculateDaysRemaining(project),
                fundingStatus: this.getFundingStatus(project),
            };
        }));
        return {
            projects: projectsWithStats,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async findFeatured(limit = 10) {
        const projects = await this.projectModel
            .find({ isFeatured: true, isVisible: true, status: enhanced_project_schema_2.ProjectStatus.ACTIVE })
            .sort({ priority: -1, createdAt: -1 })
            .limit(limit)
            .populate('projectManager', 'name avatar')
            .lean();
        return Promise.all(projects.map(async (project) => ({
            ...project,
            donationStats: await this.getDonationStats(project._id.toString()),
            volunteerCount: await this.getVolunteerCount(project._id.toString()),
            progressPercentage: this.calculateProgress(project),
        })));
    }
    async findNearby(latitude, longitude, radiusKm = 50) {
        const projects = await this.projectModel
            .find({
            latitude: { $exists: true },
            longitude: { $exists: true },
            isVisible: true,
            status: enhanced_project_schema_2.ProjectStatus.ACTIVE,
        })
            .where('location')
            .near({
            center: [longitude, latitude],
            maxDistance: radiusKm * 1000,
        })
            .limit(20)
            .populate('projectManager', 'name avatar')
            .lean();
        return Promise.all(projects.map(async (project) => ({
            ...project,
            distance: this.calculateDistance(latitude, longitude, project.latitude || 0, project.longitude || 0),
            donationStats: await this.getDonationStats(project._id.toString()),
            volunteerCount: await this.getVolunteerCount(project._id.toString()),
        })));
    }
    async findByUser(userId) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const projects = await this.projectModel
            .find({
            $or: [
                { createdBy: userObjectId },
                { projectManager: userObjectId },
                { teamMembers: userObjectId },
                { volunteers: userObjectId },
            ],
            isVisible: true,
        })
            .sort({ updatedAt: -1 })
            .populate('projectManager', 'name avatar')
            .populate('teamMembers', 'name avatar')
            .lean();
        return Promise.all(projects.map(async (project) => ({
            ...project,
            donationStats: await this.getDonationStats(project._id.toString()),
            volunteerCount: await this.getVolunteerCount(project._id.toString()),
            progressPercentage: this.calculateProgress(project),
            userRole: this.getUserRoleInProject(project, userObjectId),
        })));
    }
    async findOne(id) {
        const project = await this.projectModel
            .findById(id)
            .populate('projectManager', 'name email avatar')
            .populate('teamMembers', 'name email avatar')
            .populate('volunteers', 'name email avatar')
            .populate('donors', 'name avatar')
            .populate('createdBy', 'name avatar')
            .populate('updatedBy', 'name avatar')
            .lean();
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const [donationStats, volunteerCount, recentDonations, updates] = await Promise.all([
            this.getDonationStats(id),
            this.getVolunteerCount(id),
            this.getRecentDonations(id, 5),
            this.getProjectUpdates(id),
        ]);
        return {
            ...project,
            donationStats,
            volunteerCount,
            recentDonations,
            updates,
            progressPercentage: this.calculateProgress(project),
            daysRemaining: this.calculateDaysRemaining(project),
            fundingStatus: this.getFundingStatus(project),
        };
    }
    async update(id, updateProjectDto, user) {
        const project = await this.projectModel.findById(id);
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (!this.canUpdateProject(project, user)) {
            throw new common_1.ForbiddenException('Insufficient permissions to update this project');
        }
        if (updateProjectDto.startDate && updateProjectDto.endDate) {
            if (new Date(updateProjectDto.startDate) >= new Date(updateProjectDto.endDate)) {
                throw new common_1.BadRequestException('End date must be after start date');
            }
        }
        Object.assign(project, updateProjectDto);
        project.updatedBy = new mongoose_2.Types.ObjectId(user.id);
        project.activityLog.push({
            action: 'PROJECT_UPDATED',
            description: 'Project was updated',
            userId: new mongoose_2.Types.ObjectId(user.id),
            timestamp: new Date(),
        });
        return project.save();
    }
    async remove(id, deletedBy) {
        const project = await this.projectModel.findById(id);
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        project.isDeleted = true;
        project.deletedAt = new Date();
        project.deletedBy = new mongoose_2.Types.ObjectId(deletedBy);
        project.activityLog.push({
            action: 'PROJECT_DELETED',
            description: 'Project was deleted',
            userId: new mongoose_2.Types.ObjectId(deletedBy),
            timestamp: new Date(),
        });
        return project.save();
    }
    async addVolunteer(projectId, userId) {
        const project = await this.projectModel.findById(projectId);
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (project.status !== enhanced_project_schema_2.ProjectStatus.ACTIVE) {
            throw new common_1.BadRequestException('Project is not accepting volunteers');
        }
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        if (project.volunteers.includes(userObjectId)) {
            throw new common_1.BadRequestException('Already volunteered for this project');
        }
        project.volunteers.push(userObjectId);
        project.donorCount += 1;
        project.activityLog.push({
            action: 'VOLUNTEER_ADDED',
            description: 'New volunteer joined the project',
            userId: userObjectId,
            timestamp: new Date(),
        });
        await project.save();
        await this.userModel.findByIdAndUpdate(userId, {
            $push: { volunteerProjects: project._id },
        });
        return { message: 'Successfully volunteered for project' };
    }
    async removeVolunteer(projectId, userId) {
        const project = await this.projectModel.findById(projectId);
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        if (!project.volunteers.includes(userObjectId)) {
            throw new common_1.BadRequestException('Not a volunteer for this project');
        }
        project.volunteers = project.volunteers.filter(id => !id.equals(userObjectId));
        project.donorCount = Math.max(0, project.donorCount - 1);
        project.activityLog.push({
            action: 'VOLUNTEER_REMOVED',
            description: 'Volunteer left the project',
            userId: userObjectId,
            timestamp: new Date(),
        });
        await project.save();
        await this.userModel.findByIdAndUpdate(userId, {
            $pull: { volunteerProjects: project._id },
        });
        return { message: 'Successfully removed from project volunteers' };
    }
    async processDonation(projectId, donationData, userId) {
        const project = await this.projectModel.findById(projectId);
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (project.status !== enhanced_project_schema_2.ProjectStatus.ACTIVE) {
            throw new common_1.BadRequestException('Project is not accepting donations');
        }
        const donation = new this.donationModel({
            donor: new mongoose_2.Types.ObjectId(userId),
            project: new mongoose_2.Types.ObjectId(projectId),
            amount: donationData.amount,
            currency: donationData.currency || 'USD',
            paymentMethod: donationData.paymentMethod,
            isAnonymous: donationData.isAnonymous || false,
            status: 'completed',
        });
        await donation.save();
        project.currentAmount += donationData.amount;
        project.donorCount += 1;
        project.activityLog.push({
            action: 'DONATION_RECEIVED',
            description: `Donation of ${donationData.amount} received`,
            userId: new mongoose_2.Types.ObjectId(userId),
            timestamp: new Date(),
        });
        await project.save();
        return { donation, project };
    }
    async getStatistics(metricsDto) {
        const { startDate, endDate, category, status } = metricsDto;
        const matchStage = {};
        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate)
                matchStage.createdAt.$gte = new Date(startDate);
            if (endDate)
                matchStage.createdAt.$lte = new Date(endDate);
        }
        if (category)
            matchStage.category = category;
        if (status)
            matchStage.status = status;
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalProjects: { $sum: 1 },
                    totalTargetAmount: { $sum: '$targetAmount' },
                    totalCurrentAmount: { $sum: '$currentAmount' },
                    totalDonors: { $sum: '$donorCount' },
                    totalVolunteers: { $sum: { $size: '$volunteers' } },
                    avgTargetAmount: { $avg: '$targetAmount' },
                    avgCurrentAmount: { $avg: '$currentAmount' },
                    completedProjects: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    activeProjects: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                },
            },
        ];
        const [overallStats, categoryStats, statusStats, monthlyStats] = await Promise.all([
            this.projectModel.aggregate(pipeline),
            this.projectModel.aggregate([
                { $match: matchStage },
                { $group: { _id: '$category', count: { $sum: 1 }, totalAmount: { $sum: '$targetAmount' } } },
                { $sort: { count: -1 } },
            ]),
            this.projectModel.aggregate([
                { $match: matchStage },
                { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$currentAmount' } } },
                { $sort: { count: -1 } },
            ]),
            this.projectModel.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$targetAmount' },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);
        return {
            overall: overallStats[0] || {},
            byCategory: categoryStats,
            byStatus: statusStats,
            monthlyTrends: monthlyStats,
        };
    }
    async generateUniqueSlug(baseSlug) {
        let slug = baseSlug.toLowerCase().replace(/[^a-z0-9]/g, '-');
        let counter = 1;
        let uniqueSlug = slug;
        while (await this.projectModel.findOne({ slug: uniqueSlug })) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }
        return uniqueSlug;
    }
    async getDonationStats(projectId) {
        var _a;
        const stats = await this.donationModel.aggregate([
            { $match: { project: new mongoose_2.Types.ObjectId(projectId), status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    donorCount: { $addToSet: '$donor' },
                    averageDonation: { $avg: '$amount' },
                    largestDonation: { $max: '$amount' },
                    smallestDonation: { $min: '$amount' },
                },
            },
        ]);
        const result = stats[0] || {};
        return {
            totalAmount: result.totalAmount || 0,
            donorCount: ((_a = result.donorCount) === null || _a === void 0 ? void 0 : _a.length) || 0,
            averageDonation: result.averageDonation || 0,
            largestDonation: result.largestDonation || 0,
            smallestDonation: result.smallestDonation || 0,
        };
    }
    async getVolunteerCount(projectId) {
        var _a;
        const project = await this.projectModel.findById(projectId).select('volunteers');
        return ((_a = project === null || project === void 0 ? void 0 : project.volunteers) === null || _a === void 0 ? void 0 : _a.length) || 0;
    }
    calculateProgress(project) {
        if (project.targetAmount === 0)
            return 0;
        return Math.min((project.currentAmount / project.targetAmount) * 100, 100);
    }
    calculateDaysRemaining(project) {
        const today = new Date();
        const endDate = new Date(project.endDate);
        const diffTime = endDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    getFundingStatus(project) {
        const percentage = this.calculateProgress(project);
        if (percentage >= 100)
            return 'completed';
        if (percentage >= 75)
            return 'nearly_complete';
        if (percentage >= 50)
            return 'half_funded';
        if (percentage >= 25)
            return 'quarter_funded';
        return 'just_started';
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    getUserRoleInProject(project, userId) {
        var _a;
        if (project.createdBy.equals(userId))
            return 'creator';
        if ((_a = project.projectManager) === null || _a === void 0 ? void 0 : _a.equals(userId))
            return 'manager';
        if (project.teamMembers.some((id) => id.equals(userId)))
            return 'team_member';
        if (project.volunteers.some((id) => id.equals(userId)))
            return 'volunteer';
        return 'none';
    }
    canUpdateProject(project, user) {
        if (user.role === role_enum_1.Role.ADMIN)
            return true;
        if (user.role === role_enum_1.Role.MANAGER)
            return true;
        if (project.createdBy && project.createdBy.toString() === user.id)
            return true;
        if (project.projectManager && project.projectManager.toString() === user.id)
            return true;
        return false;
    }
    async getRecentDonations(projectId, limit) {
        return this.donationModel
            .find({ project: new mongoose_2.Types.ObjectId(projectId), status: 'completed' })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('donor', 'name avatar')
            .lean();
    }
    async getProjectUpdates(projectId) {
        return [];
    }
    async getDonations(projectId, page, limit, user) {
        var _a;
        const project = await this.projectModel.findById(projectId);
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (user.role !== role_enum_1.Role.ADMIN && project.createdBy && !project.createdBy.equals(user.id) && !((_a = project.projectManager) === null || _a === void 0 ? void 0 : _a.equals(user.id))) {
            throw new common_1.ForbiddenException('Insufficient permissions to view donations');
        }
        const donations = await this.donationModel
            .find({ project: new mongoose_2.Types.ObjectId(projectId), status: 'completed' })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('donor', 'name avatar email')
            .lean();
        const total = await this.donationModel.countDocuments({
            project: new mongoose_2.Types.ObjectId(projectId),
            status: 'completed',
        });
        return {
            donations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getVolunteers(projectId) {
        const project = await this.projectModel
            .findById(projectId)
            .populate('volunteers', 'name email avatar phone city country')
            .lean();
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return project.volunteers;
    }
    async addUpdate(projectId, updateData, userId) {
        const project = await this.projectModel.findById(projectId);
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        project.activityLog.push({
            action: 'UPDATE_ADDED',
            description: 'Project update was added',
            userId: new mongoose_2.Types.ObjectId(userId),
            timestamp: new Date(),
        });
        await project.save();
        return { message: 'Project update added successfully' };
    }
    async getUpdates(projectId) {
        return [];
    }
};
exports.EnhancedProjectService = EnhancedProjectService;
exports.EnhancedProjectService = EnhancedProjectService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(enhanced_project_schema_1.EnhancedProject.name)),
    __param(1, (0, mongoose_1.InjectModel)(enhanced_user_schema_1.EnhancedUser.name)),
    __param(2, (0, mongoose_1.InjectModel)(donation_schema_1.Donation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], EnhancedProjectService);
//# sourceMappingURL=enhanced-project.service.js.map