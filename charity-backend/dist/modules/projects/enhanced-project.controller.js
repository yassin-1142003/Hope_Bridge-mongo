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
exports.EnhancedProjectController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const enhanced_project_service_1 = require("./enhanced-project.service");
const create_project_dto_1 = require("./dto/create-project.dto");
const update_project_dto_1 = require("./dto/update-project.dto");
const filter_projects_dto_1 = require("./dto/filter-projects.dto");
const project_metrics_dto_1 = require("./dto/project-metrics.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
let EnhancedProjectController = class EnhancedProjectController {
    constructor(projectService) {
        this.projectService = projectService;
    }
    async createProject(createProjectDto, req) {
        try {
            const project = await this.projectService.create(createProjectDto, req.user.id);
            return {
                success: true,
                message: 'Project created successfully',
                data: project,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getProjects(filterDto, req) {
        try {
            const result = await this.projectService.findAll(filterDto, req.user);
            return {
                success: true,
                message: 'Projects retrieved successfully',
                data: result,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getFeaturedProjects(limit) {
        try {
            const projects = await this.projectService.findFeatured(limit);
            return {
                success: true,
                message: 'Featured projects retrieved successfully',
                data: projects,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getNearbyProjects(latitude, longitude, radius = 50) {
        try {
            const projects = await this.projectService.findNearby(latitude, longitude, radius);
            return {
                success: true,
                message: 'Nearby projects retrieved successfully',
                data: projects,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getMyProjects(req) {
        try {
            const projects = await this.projectService.findByUser(req.user.id);
            return {
                success: true,
                message: 'User projects retrieved successfully',
                data: projects,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getProjectStatistics(metricsDto) {
        try {
            const statistics = await this.projectService.getStatistics(metricsDto);
            return {
                success: true,
                message: 'Statistics retrieved successfully',
                data: statistics,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getProject(id) {
        try {
            const project = await this.projectService.findOne(id);
            return {
                success: true,
                message: 'Project retrieved successfully',
                data: project,
            };
        }
        catch (error) {
            throw new common_1.NotFoundException('Project not found');
        }
    }
    async updateProject(id, updateProjectDto, req) {
        try {
            const project = await this.projectService.update(id, updateProjectDto, req.user);
            return {
                success: true,
                message: 'Project updated successfully',
                data: project,
            };
        }
        catch (error) {
            if (error.message.includes('not found')) {
                throw new common_1.NotFoundException('Project not found');
            }
            if (error.message.includes('permission')) {
                throw new common_1.ForbiddenException(error.message);
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async deleteProject(id, req) {
        var _a;
        try {
            await this.projectService.remove(id, req.user.id);
            return {
                success: true,
                message: 'Project deleted successfully',
            };
        }
        catch (error) {
            if ((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('not found')) {
                throw new common_1.NotFoundException('Project not found');
            }
            throw new common_1.BadRequestException((error === null || error === void 0 ? void 0 : error.message) || 'Unknown error occurred');
        }
    }
    async volunteerForProject(id, req) {
        var _a;
        try {
            const result = await this.projectService.addVolunteer(id, req.user.id);
            return {
                success: true,
                message: 'Successfully volunteered for project',
                data: result,
            };
        }
        catch (error) {
            if ((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('not found')) {
                throw new common_1.NotFoundException('Project not found');
            }
            throw new common_1.BadRequestException((error === null || error === void 0 ? void 0 : error.message) || 'Unknown error occurred');
        }
    }
    async removeVolunteerFromProject(id, req) {
        var _a;
        try {
            const result = await this.projectService.removeVolunteer(id, req.user.id);
            return {
                success: true,
                message: 'Successfully removed from project volunteers',
                data: result,
            };
        }
        catch (error) {
            if ((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('not found')) {
                throw new common_1.NotFoundException('Project not found');
            }
            throw new common_1.BadRequestException((error === null || error === void 0 ? void 0 : error.message) || 'Unknown error occurred');
        }
    }
    async donateToProject(id, donationData, req) {
        var _a;
        try {
            const result = await this.projectService.processDonation(id, donationData, req.user.id);
            return {
                success: true,
                message: 'Donation processed successfully',
                data: result,
            };
        }
        catch (error) {
            if ((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('not found')) {
                throw new common_1.NotFoundException('Project not found');
            }
            throw new common_1.BadRequestException((error === null || error === void 0 ? void 0 : error.message) || 'Unknown error occurred');
        }
    }
    async getProjectDonations(id, page = 1, limit = 10, req) {
        try {
            const donations = await this.projectService.getDonations(id, page, limit, req.user);
            return {
                success: true,
                message: 'Donations retrieved successfully',
                data: donations,
            };
        }
        catch (error) {
            if (error.message.includes('not found')) {
                throw new common_1.NotFoundException('Project not found');
            }
            if (error.message.includes('permission')) {
                throw new common_1.ForbiddenException(error.message);
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getProjectVolunteers(id) {
        try {
            const volunteers = await this.projectService.getVolunteers(id);
            return {
                success: true,
                message: 'Volunteers retrieved successfully',
                data: volunteers,
            };
        }
        catch (error) {
            throw new common_1.NotFoundException('Project not found');
        }
    }
    async addProjectUpdate(id, updateData, req) {
        var _a;
        try {
            const result = await this.projectService.addUpdate(id, updateData, req.user.id);
            return {
                success: true,
                message: 'Project update added successfully',
                data: result,
            };
        }
        catch (error) {
            if ((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('not found')) {
                throw new common_1.NotFoundException('Project not found');
            }
            throw new common_1.BadRequestException((error === null || error === void 0 ? void 0 : error.message) || 'Unknown error occurred');
        }
    }
    async getProjectUpdates(id) {
        try {
            const updates = await this.projectService.getUpdates(id);
            return {
                success: true,
                message: 'Project updates retrieved successfully',
                data: updates,
            };
        }
        catch (error) {
            throw new common_1.NotFoundException('Project not found');
        }
    }
};
exports.EnhancedProjectController = EnhancedProjectController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new project' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Project created successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_project_dto_1.CreateProjectDto, Object]),
    __metadata("design:returntype", Promise)
], EnhancedProjectController.prototype, "createProject", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all projects with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Projects retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'featured', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_projects_dto_1.FilterProjectsDto, Object]),
    __metadata("design:returntype", Promise)
], EnhancedProjectController.prototype, "getProjects", null);
__decorate([
    (0, common_1.Get)('featured'),
    (0, swagger_1.ApiOperation)({ summary: 'Get featured projects' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Featured projects retrieved successfully' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EnhancedProjectController.prototype, "getFeaturedProjects", null);
__decorate([
    (0, common_1.Get)('nearby'),
    (0, swagger_1.ApiOperation)({ summary: 'Get projects near a location' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Nearby projects retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'latitude', required: true, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'longitude', required: true, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'radius', required: false, type: Number }),
    __param(0, (0, common_1.Query)('latitude')),
    __param(1, (0, common_1.Query)('longitude')),
    __param(2, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], EnhancedProjectController.prototype, "getNearbyProjects", null);
__decorate([
    (0, common_1.Get)('my-projects'),
    (0, swagger_1.ApiOperation)({ summary: 'Get projects for the current user' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'User projects retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EnhancedProjectController.prototype, "getMyProjects", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project statistics and analytics' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Statistics retrieved successfully' }),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_metrics_dto_1.ProjectMetricsDto]),
    __metadata("design:returntype", Promise)
], EnhancedProjectController.prototype, "getProjectStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific project by ID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Project retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Project not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnhancedProjectController.prototype, "getProject", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a project' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Project updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Project not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_project_dto_1.UpdateProjectDto, Object]),
    __metadata("design:returntype", Promise)
], EnhancedProjectController.prototype, "updateProject", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a project (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Project deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Project not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EnhancedProjectController.prototype, "deleteProject", null);
__decorate([
    (0, common_1.Post)(':id/volunteer'),
    (0, swagger_1.ApiOperation)({ summary: 'Volunteer for a project' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Successfully volunteered for project' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Project not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Already volunteered or project not accepting volunteers' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EnhancedProjectController.prototype, "volunteerForProject", null);
__decorate([
    (0, common_1.Delete)(':id/volunteer'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove volunteer from project' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Successfully removed from project volunteers' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Project not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Not a volunteer for this project' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EnhancedProjectController.prototype, "removeVolunteerFromProject", null);
__decorate([
    (0, common_1.Post)(':id/donate'),
    (0, swagger_1.ApiOperation)({ summary: 'Donate to a project' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Donation processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Project not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid donation amount or payment processing failed' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EnhancedProjectController.prototype, "donateToProject", null);
__decorate([
    (0, common_1.Get)(':id/donations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get donations for a project' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Donations retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Project not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], EnhancedProjectController.prototype, "getProjectDonations", null);
__decorate([
    (0, common_1.Get)(':id/volunteers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get volunteers for a project' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Volunteers retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Project not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnhancedProjectController.prototype, "getProjectVolunteers", null);
__decorate([
    (0, common_1.Post)(':id/updates'),
    (0, swagger_1.ApiOperation)({ summary: 'Add project update' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Project update added successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Project not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EnhancedProjectController.prototype, "addProjectUpdate", null);
__decorate([
    (0, common_1.Get)(':id/updates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project updates' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Project updates retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Project not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnhancedProjectController.prototype, "getProjectUpdates", null);
exports.EnhancedProjectController = EnhancedProjectController = __decorate([
    (0, swagger_1.ApiTags)('projects'),
    (0, common_1.Controller)('projects'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, throttler_1.ThrottlerGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [enhanced_project_service_1.EnhancedProjectService])
], EnhancedProjectController);
//# sourceMappingURL=enhanced-project.controller.js.map