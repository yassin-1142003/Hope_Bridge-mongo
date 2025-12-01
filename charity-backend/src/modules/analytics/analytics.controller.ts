import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AnalyticsService, VisitDocument } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(ThrottlerGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('visit')
  @ApiOperation({ summary: 'Track a project visit' })
  @ApiResponse({ status: 201, description: 'Visit tracked successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async trackVisit(@Body() visitData: any) {
    try {
      const result = await this.analyticsService.trackVisit(visitData);
      return {
        success: true,
        message: 'Visit tracked successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to track visit',
        error: (error as Error).message,
      };
    }
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get project analytics' })
  @ApiParam({ name: 'projectId', type: String, description: 'Project ID' })
  @ApiQuery({ name: 'timeframe', enum: ['day', 'week', 'month', 'year'], required: false, description: 'Timeframe for analytics' })
  @ApiResponse({ status: 200, description: 'Project analytics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getProjectAnalytics(
    @Param('projectId') projectId: string,
    @Query('timeframe') timeframe: 'day' | 'week' | 'month' | 'year' = 'week',
  ) {
    try {
      const analytics = await this.analyticsService.getProjectAnalytics(projectId, timeframe);
      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get project analytics',
        error: (error as Error).message,
        data: null,
      };
    }
  }

  @Get('user/:userId/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get user visit history' })
  @ApiParam({ name: 'userId', type: String, description: 'User ID' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of visits to return' })
  @ApiResponse({ status: 200, description: 'User visit history retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getUserVisitHistory(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 50,
  ): Promise<{ success: boolean; data: VisitDocument[] | null; message?: string; error?: string }> {
    try {
      const history = await this.analyticsService.getUserVisitHistory(userId, limit);
      return {
        success: true,
        data: history,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get user visit history',
        error: (error as Error).message,
        data: null,
      };
    }
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get dashboard analytics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Dashboard analytics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getDashboardAnalytics(): Promise<{ success: boolean; data: any | null; message?: string; error?: string }> {
    try {
      const analytics = await this.analyticsService.getDashboardAnalytics();
      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get dashboard analytics',
        error: (error as Error).message,
        data: null,
      };
    }
  }
}
