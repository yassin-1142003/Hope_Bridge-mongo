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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const dashboard_service_1 = require("./dashboard.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getAdminDashboard() {
        try {
            const stats = await this.dashboardService.getDashboardStats();
            return {
                success: true,
                data: stats,
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to get dashboard statistics',
                error: error.message,
            };
        }
    }
    async getUserDashboard(req) {
        try {
            const userId = req.user.id;
            const dashboard = await this.dashboardService.getUserDashboard(userId);
            return {
                success: true,
                data: dashboard,
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to get user dashboard',
                error: error.message,
            };
        }
    }
    async getProjectDashboard(projectId, req) {
        try {
            const analytics = await this.dashboardService.getProjectAnalytics(projectId);
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
            };
        }
    }
    async getOverviewStats(period = 'week') {
        try {
            const stats = await this.dashboardService.getDashboardStats();
            return {
                success: true,
                data: {
                    ...stats,
                    period,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to get overview statistics',
                error: error.message,
            };
        }
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin dashboard statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getAdminDashboard", null);
__decorate([
    (0, common_1.Get)('user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.USER, role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get user dashboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User dashboard retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getUserDashboard", null);
__decorate([
    (0, common_1.Get)('project/:projectId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.USER, role_enum_1.Role.ADMIN, role_enum_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get project analytics dashboard' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', type: String, description: 'Project ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Project analytics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getProjectDashboard", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get overview statistics (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'period', enum: ['day', 'week', 'month', 'year'], required: false, description: 'Time period for stats' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Overview statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getOverviewStats", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('dashboard'),
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map