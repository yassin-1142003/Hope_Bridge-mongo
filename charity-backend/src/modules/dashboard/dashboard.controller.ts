import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(ThrottlerGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getAdminDashboard() {
    try {
      const stats = await this.dashboardService.getDashboardStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get dashboard statistics',
        error: (error as Error).message,
      };
    }
  }

  @Get('user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get user dashboard' })
  @ApiResponse({ status: 200, description: 'User dashboard retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getUserDashboard(@Request() req: any) {
    try {
      const userId = req.user.id;
      const dashboard = await this.dashboardService.getUserDashboard(userId);
      return {
        success: true,
        data: dashboard,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get user dashboard',
        error: (error as Error).message,
      };
    }
  }

  @Get('project/:projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get project analytics dashboard' })
  @ApiParam({ name: 'projectId', type: String, description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project analytics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getProjectDashboard(@Param('projectId') projectId: string, @Request() req: any) {
    try {
      const analytics = await this.dashboardService.getProjectAnalytics(projectId);
      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get project analytics',
        error: (error as Error).message,
      };
    }
  }

  @Get('stats/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get overview statistics (Admin only)' })
  @ApiQuery({ name: 'period', enum: ['day', 'week', 'month', 'year'], required: false, description: 'Time period for stats' })
  @ApiResponse({ status: 200, description: 'Overview statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getOverviewStats(@Query('period') period: string = 'week') {
    try {
      // This could be expanded to include time-based filtering
      const stats = await this.dashboardService.getDashboardStats();
      return {
        success: true,
        data: {
          ...stats,
          period,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get overview statistics',
        error: (error as Error).message,
      };
    }
  }
}
