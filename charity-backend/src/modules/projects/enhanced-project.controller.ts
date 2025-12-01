import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  ParseUUIDPipe,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EnhancedProjectService } from './enhanced-project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FilterProjectsDto } from './dto/filter-projects.dto';
import { ProjectMetricsDto } from './dto/project-metrics.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard, ThrottlerGuard, RolesGuard)
export class EnhancedProjectController {
  constructor(private readonly projectService: EnhancedProjectService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Project created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  @Roles(Role.ADMIN, Role.MANAGER)
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req: any,
  ) {
    try {
      const project = await this.projectService.create(createProjectDto, req.user.id);
      return {
        success: true,
        message: 'Project created successfully',
        data: project,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects with filtering and pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Projects retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getProjects(
    @Query() filterDto: FilterProjectsDto,
    @Request() req: any,
  ) {
    try {
      const result = await this.projectService.findAll(filterDto, req.user);
      return {
        success: true,
        message: 'Projects retrieved successfully',
        data: result,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured projects' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Featured projects retrieved successfully' })
  async getFeaturedProjects(@Query('limit') limit?: number) {
    try {
      const projects = await this.projectService.findFeatured(limit);
      return {
        success: true,
        message: 'Featured projects retrieved successfully',
        data: projects,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get projects near a location' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Nearby projects retrieved successfully' })
  @ApiQuery({ name: 'latitude', required: true, type: Number })
  @ApiQuery({ name: 'longitude', required: true, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number })
  async getNearbyProjects(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number = 50,
  ) {
    try {
      const projects = await this.projectService.findNearby(latitude, longitude, radius);
      return {
        success: true,
        message: 'Nearby projects retrieved successfully',
        data: projects,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('my-projects')
  @ApiOperation({ summary: 'Get projects for the current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User projects retrieved successfully' })
  async getMyProjects(@Request() req: any) {
    try {
      const projects = await this.projectService.findByUser(req.user.id);
      return {
        success: true,
        message: 'User projects retrieved successfully',
        data: projects,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get project statistics and analytics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Statistics retrieved successfully' })
  @Roles(Role.ADMIN, Role.MANAGER)
  async getProjectStatistics(@Query() metricsDto: ProjectMetricsDto) {
    try {
      const statistics = await this.projectService.getStatistics(metricsDto);
      return {
        success: true,
        message: 'Statistics retrieved successfully',
        data: statistics,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific project by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiParam({ name: 'id', type: String })
  async getProject(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const project = await this.projectService.findOne(id);
      return {
        success: true,
        message: 'Project retrieved successfully',
        data: project,
      };
    } catch (error) {
      throw new NotFoundException('Project not found');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  @ApiParam({ name: 'id', type: String })
  async updateProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: any,
  ) {
    try {
      const project = await this.projectService.update(id, updateProjectDto, req.user);
      return {
        success: true,
        message: 'Project updated successfully',
        data: project,
      };
    } catch (error: any) {
      if (error.message.includes('not found')) {
        throw new NotFoundException('Project not found');
      }
      if (error.message.includes('permission')) {
        throw new ForbiddenException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project (soft delete)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  @ApiParam({ name: 'id', type: String })
  @Roles(Role.ADMIN)
  async deleteProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    try {
      await this.projectService.remove(id, req.user.id);
      return {
        success: true,
        message: 'Project deleted successfully',
      };
    } catch (error: any) {
      if (error?.message?.includes('not found')) {
        throw new NotFoundException('Project not found');
      }
      throw new BadRequestException(error?.message || 'Unknown error occurred');
    }
  }

  @Post(':id/volunteer')
  @ApiOperation({ summary: 'Volunteer for a project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully volunteered for project' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Already volunteered or project not accepting volunteers' })
  @ApiParam({ name: 'id', type: String })
  async volunteerForProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    try {
      const result = await this.projectService.addVolunteer(id, req.user.id);
      return {
        success: true,
        message: 'Successfully volunteered for project',
        data: result,
      };
    } catch (error: any) {
      if (error?.message?.includes('not found')) {
        throw new NotFoundException('Project not found');
      }
      throw new BadRequestException(error?.message || 'Unknown error occurred');
    }
  }

  @Delete(':id/volunteer')
  @ApiOperation({ summary: 'Remove volunteer from project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully removed from project volunteers' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Not a volunteer for this project' })
  @ApiParam({ name: 'id', type: String })
  async removeVolunteerFromProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    try {
      const result = await this.projectService.removeVolunteer(id, req.user.id);
      return {
        success: true,
        message: 'Successfully removed from project volunteers',
        data: result,
      };
    } catch (error: any) {
      if (error?.message?.includes('not found')) {
        throw new NotFoundException('Project not found');
      }
      throw new BadRequestException(error?.message || 'Unknown error occurred');
    }
  }

  @Post(':id/donate')
  @ApiOperation({ summary: 'Donate to a project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Donation processed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid donation amount or payment processing failed' })
  @ApiParam({ name: 'id', type: String })
  async donateToProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() donationData: { amount: number; paymentMethod: string; isAnonymous?: boolean },
    @Request() req: any,
  ) {
    try {
      const result = await this.projectService.processDonation(id, donationData, req.user.id);
      return {
        success: true,
        message: 'Donation processed successfully',
        data: result,
      };
    } catch (error: any) {
      if (error?.message?.includes('not found')) {
        throw new NotFoundException('Project not found');
      }
      throw new BadRequestException(error?.message || 'Unknown error occurred');
    }
  }

  @Get(':id/donations')
  @ApiOperation({ summary: 'Get donations for a project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Donations retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getProjectDonations(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Request() req: any,
  ) {
    try {
      const donations = await this.projectService.getDonations(id, page, limit, req.user);
      return {
        success: true,
        message: 'Donations retrieved successfully',
        data: donations,
      };
    } catch (error: any) {
      if (error.message.includes('not found')) {
        throw new NotFoundException('Project not found');
      }
      if (error.message.includes('permission')) {
        throw new ForbiddenException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id/volunteers')
  @ApiOperation({ summary: 'Get volunteers for a project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Volunteers retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiParam({ name: 'id', type: String })
  async getProjectVolunteers(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const volunteers = await this.projectService.getVolunteers(id);
      return {
        success: true,
        message: 'Volunteers retrieved successfully',
        data: volunteers,
      };
    } catch (error) {
      throw new NotFoundException('Project not found');
    }
  }

  @Post(':id/updates')
  @ApiOperation({ summary: 'Add project update' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project update added successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  @ApiParam({ name: 'id', type: String })
  @Roles(Role.ADMIN, Role.MANAGER)
  async addProjectUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: { title: string; content: string; images?: string[] },
    @Request() req: any,
  ) {
    try {
      const result = await this.projectService.addUpdate(id, updateData, req.user.id);
      return {
        success: true,
        message: 'Project update added successfully',
        data: result,
      };
    } catch (error: any) {
      if (error?.message?.includes('not found')) {
        throw new NotFoundException('Project not found');
      }
      throw new BadRequestException(error?.message || 'Unknown error occurred');
    }
  }

  @Get(':id/updates')
  @ApiOperation({ summary: 'Get project updates' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project updates retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiParam({ name: 'id', type: String })
  async getProjectUpdates(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const updates = await this.projectService.getUpdates(id);
      return {
        success: true,
        message: 'Project updates retrieved successfully',
        data: updates,
      };
    } catch (error) {
      throw new NotFoundException('Project not found');
    }
  }
}
