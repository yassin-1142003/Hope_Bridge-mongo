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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const analytics_service_1 = require("./analytics.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async trackVisit(visitData) {
        try {
            const result = await this.analyticsService.trackVisit(visitData);
            return {
                success: true,
                message: 'Visit tracked successfully',
                data: result,
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to track visit',
                error: error.message,
            };
        }
    }
    async getProjectAnalytics(projectId, timeframe = 'week') {
        try {
            const analytics = await this.analyticsService.getProjectAnalytics(projectId, timeframe);
            return {
                success: true,
                data: analytics,
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to get project analytics',
                error: error.message,
                data: null,
            };
        }
    }
    async getUserVisitHistory(userId, limit = 50) {
        try {
            const history = await this.analyticsService.getUserVisitHistory(userId, limit);
            return {
                success: true,
                data: history,
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to get user visit history',
                error: error.message,
                data: null,
            };
        }
    }
    async getDashboardAnalytics() {
        try {
            const analytics = await this.analyticsService.getDashboardAnalytics();
            return {
                success: true,
                data: analytics,
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to get dashboard analytics',
                error: error.message,
                data: null,
            };
        }
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Post)('visit'),
    (0, swagger_1.ApiOperation)({ summary: 'Track a project visit' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Visit tracked successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "trackVisit", null);
__decorate([
    (0, common_1.Get)('project/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project analytics' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', type: String, description: 'Project ID' }),
    (0, swagger_1.ApiQuery)({ name: 'timeframe', enum: ['day', 'week', 'month', 'year'], required: false, description: 'Timeframe for analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Project analytics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('timeframe')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getProjectAnalytics", null);
__decorate([
    (0, common_1.Get)('user/:userId/history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.USER, role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get user visit history' }),
    (0, swagger_1.ApiParam)({ name: 'userId', type: String, description: 'User ID' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, description: 'Number of visits to return' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User visit history retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getUserVisitHistory", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard analytics (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard analytics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDashboardAnalytics", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('analytics'),
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map