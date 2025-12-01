import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ObjectId, PipelineStage } from 'mongoose';
import { EnhancedProject } from '../../db/schemas/enhanced-project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FilterProjectsDto } from './dto/filter-projects.dto';
import { ProjectMetricsDto } from './dto/project-metrics.dto';
import { Donation, DonationDocument } from '../../db/schemas/donation.schema';
import { EnhancedUser } from '../../db/schemas/enhanced-user.schema';
import { Task, TaskDocument } from '../../db/schemas/task.schema';
import { Role } from '../../common/enums/role.enum';
import { ProjectStatus } from '../../db/schemas/enhanced-project.schema';

@Injectable()
export class EnhancedProjectService {
  constructor(
    @InjectModel(EnhancedProject.name) private projectModel: Model<EnhancedProject>,
    @InjectModel(EnhancedUser.name) private userModel: Model<EnhancedUser>,
    @InjectModel(Donation.name) private donationModel: Model<Donation>,
  ) {}

  /**
   * Create a new project with enhanced features
   */
  async create(createProjectDto: CreateProjectDto, createdBy: string): Promise<EnhancedProject> {
    // Generate unique slug
    const slug = await this.generateUniqueSlug(createProjectDto.slug || createProjectDto.contents[0]?.title);
    
    // Validate project manager if provided
    if (createProjectDto.projectManager) {
      const manager = await this.userModel.findById(createProjectDto.projectManager);
      if (!manager) {
        throw new BadRequestException('Project manager not found');
      }
    }

    // Validate dates
    if (new Date(createProjectDto.startDate) >= new Date(createProjectDto.endDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    const project = new this.projectModel({
      ...createProjectDto,
      slug,
      createdBy: new Types.ObjectId(createdBy),
      updatedBy: new Types.ObjectId(createdBy),
    });

    // Add activity log
    project.activityLog.push({
      action: 'PROJECT_CREATED',
      description: 'Project was created',
      userId: new Types.ObjectId(createdBy),
      timestamp: new Date(),
    });

    return project.save();
  }

  /**
   * Find all projects with advanced filtering and caching
   */
  async findAll(filterDto: FilterProjectsDto, user: any) {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      featured,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      city,
      country,
      priority,
      projectManager,
    } = filterDto;

    // Build query
    const query: any = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (featured !== undefined) query.isFeatured = featured;
    if (city) query.city = new RegExp(city, 'i');
    if (country) query.country = new RegExp(country, 'i');
    if (priority) query.priority = priority;
    if (projectManager) query.projectManager = new Types.ObjectId(projectManager);

    // Search functionality
    if (search) {
      query.$or = [
        { 'contents.title': new RegExp(search, 'i') },
        { 'contents.description': new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Visibility based on user role
    if (user.role !== Role.ADMIN) {
      query.isVisible = true;
    }

    // Sorting
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
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

    // Add computed fields
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
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
      }),
    );

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

  /**
   * Find featured projects
   */
  async findFeatured(limit = 10) {
    const projects = await this.projectModel
      .find({ isFeatured: true, isVisible: true, status: ProjectStatus.ACTIVE })
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit)
      .populate('projectManager', 'name avatar')
      .lean();

    return Promise.all(
      projects.map(async (project) => ({
        ...project,
        donationStats: await this.getDonationStats(project._id.toString()),
        volunteerCount: await this.getVolunteerCount(project._id.toString()),
        progressPercentage: this.calculateProgress(project),
      })),
    );
  }

  /**
   * Find projects near a location
   */
  async findNearby(latitude: number, longitude: number, radiusKm = 50) {
    const projects = await this.projectModel
      .find({
        latitude: { $exists: true },
        longitude: { $exists: true },
        isVisible: true,
        status: ProjectStatus.ACTIVE,
      })
      .where('location')
      .near({
        center: [longitude, latitude],
        maxDistance: radiusKm * 1000, // Convert to meters
      })
      .limit(20)
      .populate('projectManager', 'name avatar')
      .lean();

    return Promise.all(
      projects.map(async (project) => ({
        ...project,
        distance: this.calculateDistance(latitude, longitude, project.latitude || 0, project.longitude || 0),
        donationStats: await this.getDonationStats(project._id.toString()),
        volunteerCount: await this.getVolunteerCount(project._id.toString()),
      })),
    );
  }

  /**
   * Find projects by user
   */
  async findByUser(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    
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

    return Promise.all(
      projects.map(async (project) => ({
        ...project,
        donationStats: await this.getDonationStats(project._id.toString()),
        volunteerCount: await this.getVolunteerCount(project._id.toString()),
        progressPercentage: this.calculateProgress(project),
        userRole: this.getUserRoleInProject(project, userObjectId),
      })),
    );
  }

  /**
   * Find one project by ID
   */
  async findOne(id: string) {
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
      throw new NotFoundException('Project not found');
    }

    // Add additional data
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

  /**
   * Update a project
   */
  async update(id: string, updateProjectDto: UpdateProjectDto, user: any) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check permissions
    if (!this.canUpdateProject(project, user)) {
      throw new ForbiddenException('Insufficient permissions to update this project');
    }

    // Validate dates if provided
    if (updateProjectDto.startDate && updateProjectDto.endDate) {
      if (new Date(updateProjectDto.startDate) >= new Date(updateProjectDto.endDate)) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Update project
    Object.assign(project, updateProjectDto);
    project.updatedBy = new Types.ObjectId(user.id);

    // Add activity log
    project.activityLog.push({
      action: 'PROJECT_UPDATED',
      description: 'Project was updated',
      userId: new Types.ObjectId(user.id),
      timestamp: new Date(),
    });

    return project.save();
  }

  /**
   * Soft delete a project
   */
  async remove(id: string, deletedBy: string) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    project.isDeleted = true;
    project.deletedAt = new Date();
    project.deletedBy = new Types.ObjectId(deletedBy);

    // Add activity log
    project.activityLog.push({
      action: 'PROJECT_DELETED',
      description: 'Project was deleted',
      userId: new Types.ObjectId(deletedBy),
      timestamp: new Date(),
    });

    return project.save();
  }

  /**
   * Add volunteer to project
   */
  async addVolunteer(projectId: string, userId: string) {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.status !== ProjectStatus.ACTIVE) {
      throw new BadRequestException('Project is not accepting volunteers');
    }

    const userObjectId = new Types.ObjectId(userId);
    
    // Check if already a volunteer
    if (project.volunteers.includes(userObjectId)) {
      throw new BadRequestException('Already volunteered for this project');
    }

    project.volunteers.push(userObjectId);
    project.donorCount += 1;

    // Add activity log
    project.activityLog.push({
      action: 'VOLUNTEER_ADDED',
      description: 'New volunteer joined the project',
      userId: userObjectId,
      timestamp: new Date(),
    });

    await project.save();

    // Update user's volunteer projects
    await this.userModel.findByIdAndUpdate(userId, {
      $push: { volunteerProjects: project._id },
    });

    return { message: 'Successfully volunteered for project' };
  }

  /**
   * Remove volunteer from project
   */
  async removeVolunteer(projectId: string, userId: string) {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    
    // Check if user is a volunteer
    if (!project.volunteers.includes(userObjectId)) {
      throw new BadRequestException('Not a volunteer for this project');
    }

    project.volunteers = project.volunteers.filter(id => !id.equals(userObjectId));
    project.donorCount = Math.max(0, project.donorCount - 1);

    // Add activity log
    project.activityLog.push({
      action: 'VOLUNTEER_REMOVED',
      description: 'Volunteer left the project',
      userId: userObjectId,
      timestamp: new Date(),
    });

    await project.save();

    // Update user's volunteer projects
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { volunteerProjects: project._id },
    });

    return { message: 'Successfully removed from project volunteers' };
  }

  /**
   * Process donation to project
   */
  async processDonation(projectId: string, donationData: any, userId: string) {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.status !== ProjectStatus.ACTIVE) {
      throw new BadRequestException('Project is not accepting donations');
    }

    // Create donation record
    const donation = new this.donationModel({
      donor: new Types.ObjectId(userId),
      project: new Types.ObjectId(projectId),
      amount: donationData.amount,
      currency: donationData.currency || 'USD',
      paymentMethod: donationData.paymentMethod,
      isAnonymous: donationData.isAnonymous || false,
      status: 'completed',
    });

    await donation.save();

    // Update project funding
    project.currentAmount += donationData.amount;
    project.donorCount += 1;

    // Add activity log
    project.activityLog.push({
      action: 'DONATION_RECEIVED',
      description: `Donation of ${donationData.amount} received`,
      userId: new Types.ObjectId(userId),
      timestamp: new Date(),
    });

    await project.save();

    return { donation, project };
  }

  /**
   * Get project statistics and analytics
   */
  async getStatistics(metricsDto: ProjectMetricsDto) {
    const { startDate, endDate, category, status } = metricsDto;

    const matchStage: any = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }
    if (category) matchStage.category = category;
    if (status) matchStage.status = status;

    const pipeline: PipelineStage[] = [
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

  /**
   * Helper methods
   */
  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug.toLowerCase().replace(/[^a-z0-9]/g, '-');
    let counter = 1;
    let uniqueSlug = slug;

    while (await this.projectModel.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  private async getDonationStats(projectId: string) {
    const stats = await this.donationModel.aggregate([
      { $match: { project: new Types.ObjectId(projectId), status: 'completed' } },
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
      donorCount: result.donorCount?.length || 0,
      averageDonation: result.averageDonation || 0,
      largestDonation: result.largestDonation || 0,
      smallestDonation: result.smallestDonation || 0,
    };
  }

  private async getVolunteerCount(projectId: string): Promise<number> {
    const project = await this.projectModel.findById(projectId).select('volunteers');
    return project?.volunteers?.length || 0;
  }

  private calculateProgress(project: any): number {
    if (project.targetAmount === 0) return 0;
    return Math.min((project.currentAmount / project.targetAmount) * 100, 100);
  }

  private calculateDaysRemaining(project: any): number {
    const today = new Date();
    const endDate = new Date(project.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private getFundingStatus(project: any): string {
    const percentage = this.calculateProgress(project);
    if (percentage >= 100) return 'completed';
    if (percentage >= 75) return 'nearly_complete';
    if (percentage >= 50) return 'half_funded';
    if (percentage >= 25) return 'quarter_funded';
    return 'just_started';
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private getUserRoleInProject(project: any, userId: Types.ObjectId): string {
    if (project.createdBy.equals(userId)) return 'creator';
    if (project.projectManager?.equals(userId)) return 'manager';
    if (project.teamMembers.some((id: Types.ObjectId) => id.equals(userId))) return 'team_member';
    if (project.volunteers.some((id: Types.ObjectId) => id.equals(userId))) return 'volunteer';
    return 'none';
  }

  private canUpdateProject(project: EnhancedProject, user: any): boolean {
    if (user.role === Role.ADMIN) return true;
    if (user.role === Role.MANAGER) return true;
    if (project.createdBy && project.createdBy.toString() === user.id) return true;
    if (project.projectManager && project.projectManager.toString() === user.id) return true;
    return false;
  }

  private async getRecentDonations(projectId: string, limit: number) {
    return this.donationModel
      .find({ project: new Types.ObjectId(projectId), status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('donor', 'name avatar')
      .lean();
  }

  private async getProjectUpdates(projectId: string) {
    // This would be implemented when we create the project updates schema
    return [];
  }

  async getDonations(projectId: string, page: number, limit: number, user: any) {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check permissions
    if (user.role !== Role.ADMIN && project.createdBy && !project.createdBy.equals(user.id) && !project.projectManager?.equals(user.id)) {
      throw new ForbiddenException('Insufficient permissions to view donations');
    }

    const donations = await this.donationModel
      .find({ project: new Types.ObjectId(projectId), status: 'completed' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('donor', 'name avatar email')
      .lean();

    const total = await this.donationModel.countDocuments({
      project: new Types.ObjectId(projectId),
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

  async getVolunteers(projectId: string) {
    const project = await this.projectModel
      .findById(projectId)
      .populate('volunteers', 'name email avatar phone city country')
      .lean();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project.volunteers;
  }

  async addUpdate(projectId: string, updateData: any, userId: string) {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // This would be implemented when we create the project updates schema
    // For now, just add to activity log
    project.activityLog.push({
      action: 'UPDATE_ADDED',
      description: 'Project update was added',
      userId: new Types.ObjectId(userId),
      timestamp: new Date(),
    });

    await project.save();
    return { message: 'Project update added successfully' };
  }

  async getUpdates(projectId: string) {
    // This would be implemented when we create the project updates schema
    return [];
  }
}
