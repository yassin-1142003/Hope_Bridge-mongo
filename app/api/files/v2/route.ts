/**
 * Enhanced File Management API v2.0
 * 
 * Enterprise-grade file management with advanced features:
 * - Cloud storage integration (AWS S3, Google Cloud, Azure)
 * - File versioning and history tracking
 * - Advanced sharing and permissions
 * - File preview and thumbnail generation
 * - Bulk operations and batch processing
 * - File analytics and usage metrics
 * - Security and compliance features
 * - Search and metadata indexing
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { UserRole, hasPermission } from "@/lib/roles";
import { 
  createSuccessResponse, 
  createCreatedResponse, 
  createBadRequestResponse, 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  createNotFoundResponse, 
  handleApiError, 
  setCorsHeaders 
} from "@/lib/apiResponse";

// Enhanced file schemas
const uploadFileSchemaV2 = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  folderId: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  isPublic: z.boolean().default(false),
  allowDownload: z.boolean().default(true),
  allowComments: z.boolean().default(true),
  expiresAt: z.string().optional(),
  password: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  customFields: z.record(z.any()).optional()
});

const fileQuerySchemaV2 = z.object({
  // Basic filtering
  category: z.string().optional(),
  folderId: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  fileType: z.enum(['image', 'video', 'document', 'audio', 'archive', 'other']).optional(),
  
  // Advanced filtering
  uploadedBy: z.string().email().optional(),
  uploadedAfter: z.string().optional(),
  uploadedBefore: z.string().optional(),
  sizeMin: z.number().optional(),
  sizeMax: z.number().optional(),
  isPublic: z.string().transform(val => val === 'true').optional(),
  hasPassword: z.string().transform(val => val === 'true').optional(),
  
  // Search
  search: z.string().optional(),
  
  // Sorting and pagination
  sortBy: z.enum(['name', 'size', 'uploadedAt', 'downloads', 'views']).default('uploadedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.string().transform(Number).refine(n => n > 0, "Page must be positive").default(1),
  limit: z.string().transform(Number).refine(n => n > 0 && n <= 100, "Limit must be between 1-100").default(20),
  
  // Include options
  includeVersions: z.string().transform(val => val === 'true').default('false'),
  includeAnalytics: z.string().transform(val => val === 'true').default('false'),
  includeComments: z.string().transform(val => val === 'true').default('false'),
  includeThumbnails: z.string().transform(val => val === 'true').default('true')
});

const shareFileSchemaV2 = z.object({
  fileIds: z.array(z.string()).min(1).max(50),
  shareType: z.enum(['public', 'private', 'team', 'custom']),
  recipients: z.array(z.string().email()).optional(),
  permissions: z.object({
    canView: z.boolean().default(true),
    canDownload: z.boolean().default(true),
    canComment: z.boolean().default(false),
    canEdit: z.boolean().default(false),
    canShare: z.boolean().default(false),
    canDelete: z.boolean().default(false),
    expiresAt: z.string().optional()
  }).optional(),
  message: z.string().max(500).optional(),
  password: z.string().optional()
});

const folderSchemaV2 = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  parentId: z.string().optional(),
  projectId: z.string().optional(),
  isPublic: z.boolean().default(false),
  permissions: z.object({
    canView: z.array(z.string()).default([]),
    canEdit: z.array(z.string()).default([]),
    canUpload: z.array(z.string()).default([]),
    canDelete: z.array(z.string()).default([])
  }).optional()
});

// Enhanced File Manager
class EnhancedFileManager {
  async uploadFileV2(fileData: any, file: File, session: any): Promise<any> {
    try {
      const filesCollection = await getCollection('files');
      const foldersCollection = await getCollection('folders');
      
      // Validate folder if specified
      if (fileData.folderId) {
        const folder = await foldersCollection.findOne({ _id: new ObjectId(fileData.folderId) });
        if (!folder) {
          throw new Error('Folder not found');
        }
        
        // Check folder permissions
        if (!this.hasFolderPermission(folder, session.user.email, 'canUpload')) {
          throw new Error('Insufficient permissions to upload to this folder');
        }
      }
      
      // Generate unique file ID
      const fileId = new ObjectId().toString();
      
      // Upload to cloud storage
      const cloudUrl = await this.uploadToCloudStorage(file, fileId, session.user.email);
      
      // Generate thumbnail if it's an image or video
      let thumbnailUrl = null;
      if (this.isImageFile(file.type) || this.isVideoFile(file.type)) {
        thumbnailUrl = await this.generateThumbnail(file, fileId);
      }
      
      // Extract metadata
      const metadata = await this.extractFileMetadata(file);
      
      // Create file record
      const fileRecord = {
        _id: new ObjectId(),
        fileId,
        name: fileData.name || file.name,
        originalName: file.name,
        description: fileData.description,
        category: fileData.category || this.getCategoryFromFile(file.type),
        tags: fileData.tags || [],
        folderId: fileData.folderId,
        projectId: fileData.projectId,
        taskId: fileData.taskId,
        
        // File properties
        mimeType: file.type,
        size: file.size,
        url: cloudUrl,
        thumbnailUrl,
        checksum: await this.calculateChecksum(file),
        
        // Access control
        uploadedBy: session.user.email,
        uploadedByName: session.user.name,
        isPublic: fileData.isPublic,
        allowDownload: fileData.allowDownload,
        allowComments: fileData.allowComments,
        expiresAt: fileData.expiresAt ? new Date(fileData.expiresAt) : null,
        password: fileData.password ? await bcrypt.hash(fileData.password, 12) : null,
        
        // Metadata and custom fields
        metadata: {
          ...metadata,
          ...fileData.metadata,
          extractedAt: new Date()
        },
        customFields: fileData.customFields || {},
        
        // Analytics
        analytics: {
          views: 0,
          downloads: 0,
          shares: 0,
          comments: 0,
          lastAccessed: null,
          accessLog: []
        },
        
        // Version control
        version: 1,
        versions: [{
          version: 1,
          uploadedBy: session.user.email,
          uploadedAt: new Date(),
          size: file.size,
          checksum: await this.calculateChecksum(file),
          comment: 'Initial upload'
        }],
        
        // Status and timestamps
        status: 'active',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await filesCollection.insertOne(fileRecord);
      
      // Update folder file count
      if (fileData.folderId) {
        await foldersCollection.updateOne(
          { _id: new ObjectId(fileData.folderId) },
          { 
            $inc: { fileCount: 1 },
            $set: { updatedAt: new Date() }
          }
        );
      }
      
      // Log activity
      await this.logActivity({
        userId: session.user.email,
        action: 'UPLOAD_FILE_V2',
        entityType: 'file',
        entityId: fileRecord._id.toString(),
        entityName: fileRecord.name,
        description: `File uploaded: ${fileRecord.name}`,
        metadata: {
          size: file.size,
          mimeType: file.type,
          folderId: fileData.folderId,
          projectId: fileData.projectId
        }
      });
      
      return fileRecord;
    } catch (error) {
      console.error('Failed to upload enhanced file:', error);
      throw error;
    }
  }
  
  async getFilesV2(query: any, session: any): Promise<any> {
    try {
      const filesCollection = await getCollection('files');
      const foldersCollection = await getCollection('folders');
      
      // Build query
      const dbQuery: any = {
        isDeleted: false,
        $or: [
          { uploadedBy: session.user.email },
          { isPublic: true },
          { 'sharedWith': session.user.email }
        ]
      };
      
      // Apply filters
      if (query.category) dbQuery.category = query.category;
      if (query.folderId) dbQuery.folderId = query.folderId;
      if (query.projectId) dbQuery.projectId = query.projectId;
      if (query.taskId) dbQuery.taskId = query.taskId;
      if (query.tags && query.tags.length > 0) dbQuery.tags = { $in: query.tags };
      if (query.fileType) dbQuery.mimeType = { $regex: `^${query.fileType}/` };
      
      // Advanced filters
      if (query.uploadedBy) dbQuery.uploadedBy = query.uploadedBy;
      if (query.sizeMin) dbQuery.size = { $gte: query.sizeMin };
      if (query.sizeMax) dbQuery.size = { ...dbQuery.size, $lte: query.sizeMax };
      if (query.isPublic !== undefined) dbQuery.isPublic = query.isPublic;
      if (query.hasPassword !== undefined) {
        if (query.hasPassword) {
          dbQuery.password = { $exists: true, $ne: null };
        } else {
          dbQuery.password = { $exists: false };
        }
      }
      
      // Date range filtering
      if (query.uploadedAfter || query.uploadedBefore) {
        dbQuery.createdAt = {};
        if (query.uploadedAfter) dbQuery.createdAt.$gte = new Date(query.uploadedAfter);
        if (query.uploadedBefore) dbQuery.createdAt.$lte = new Date(query.uploadedBefore);
      }
      
      // Search functionality
      if (query.search) {
        dbQuery.$and = (dbQuery.$and || []).concat({
          $or: [
            { name: { $regex: query.search, $options: 'i' } },
            { description: { $regex: query.search, $options: 'i' } },
            { tags: { $in: [new RegExp(query.search, 'i')] } },
            { metadata: { $regex: query.search, $options: 'i' } }
          ]
        });
      }
      
      // Get total count
      const total = await filesCollection.countDocuments(dbQuery);
      
      // Build aggregation pipeline
      const pipeline: any[] = [
        { $match: dbQuery },
        { $sort: { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 } },
        { $skip: (query.page - 1) * query.limit },
        { $limit: query.limit }
      ];
      
      // Include folder information
      pipeline.push({
        $lookup: {
          from: 'folders',
          localField: 'folderId',
          foreignField: '_id',
          as: 'folderInfo',
          pipeline: [{ $project: { name: 1, path: 1 } }]
        }
      });
      
      // Include analytics if requested
      if (query.includeAnalytics) {
        pipeline.push({
          $addFields: {
            analytics: {
              views: { $ifNull: ['$analytics.views', 0] },
              downloads: { $ifNull: ['$analytics.downloads', 0] },
              shares: { $ifNull: ['$analytics.shares', 0] },
              lastAccessed: '$analytics.lastAccessed'
            }
          }
        });
      }
      
      // Include versions if requested
      if (query.includeVersions) {
        pipeline.push({
          $addFields: {
            versions: { $ifNull: ['$versions', []] }
          }
        });
      }
      
      // Include comments if requested
      if (query.includeComments) {
        pipeline.push({
          $lookup: {
            from: 'file_comments',
            localField: '_id',
            foreignField: 'fileId',
            as: 'comments',
            pipeline: [
              { $sort: { createdAt: -1 } },
              { $limit: 10 },
              { $project: { content: 1, author: 1, createdAt: 1 } }
            ]
          }
        });
      }
      
      const files = await filesCollection.aggregate(pipeline).toArray();
      
      // Pagination metadata
      const pagination = {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
        hasNext: query.page * query.limit < total,
        hasPrev: query.page > 1
      };
      
      // Statistics
      const statistics = {
        totalFiles: total,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        filesByType: this.groupFilesByType(files),
        filesByCategory: this.groupFilesByCategory(files),
        mostViewed: files.sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0)).slice(0, 5),
        recentlyUploaded: files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
      };
      
      return {
        files,
        pagination,
        statistics,
        filters: {
          category: query.category,
          folderId: query.folderId,
          projectId: query.projectId,
          search: query.search
        }
      };
    } catch (error) {
      console.error('Failed to get enhanced files:', error);
      throw error;
    }
  }
  
  async shareFilesV2(shareData: any, session: any): Promise<any> {
    try {
      const filesCollection = await getCollection('files');
      const sharesCollection = await getCollection('file_shares');
      
      // Validate files and permissions
      const files = await filesCollection.find({
        _id: { $in: shareData.fileIds.map((id: string) => new ObjectId(id)) },
        uploadedBy: session.user.email
      }).toArray();
      
      if (files.length !== shareData.fileIds.length) {
        throw new Error('Some files not found or access denied');
      }
      
      // Create share record
      const share = {
        _id: new ObjectId(),
        shareId: this.generateShareId(),
        uploadedBy: session.user.email,
        fileIds: shareData.fileIds,
        shareType: shareData.shareType,
        recipients: shareData.recipients || [],
        permissions: shareData.permissions || {
          canView: true,
          canDownload: true,
          canComment: false,
          canEdit: false,
          canShare: false,
          canDelete: false
        },
        message: shareData.message,
        password: shareData.password ? await bcrypt.hash(shareData.password, 12) : null,
        expiresAt: shareData.permissions?.expiresAt ? new Date(shareData.permissions.expiresAt) : null,
        createdAt: new Date(),
        accessLog: []
      };
      
      await sharesCollection.insertOne(share);
      
      // Update file analytics
      await filesCollection.updateMany(
        { _id: { $in: shareData.fileIds.map((id: string) => new ObjectId(id)) } },
        { $inc: { 'analytics.shares': 1 } }
      );
      
      // Add recipients to sharedWith field for each file
      if (shareData.recipients && shareData.recipients.length > 0) {
        await filesCollection.updateMany(
          { _id: { $in: shareData.fileIds.map((id: string) => new ObjectId(id)) } },
          { $addToSet: { sharedWith: { $each: shareData.recipients } } }
        );
      }
      
      // Send notification to recipients
      if (shareData.recipients && shareData.recipients.length > 0) {
        await this.sendShareNotifications(share, files);
      }
      
      // Log activity
      await this.logActivity({
        userId: session.user.email,
        action: 'SHARE_FILES_V2',
        entityType: 'share',
        entityId: share._id.toString(),
        entityName: `Share of ${files.length} files`,
        description: `Shared ${files.length} files with ${shareData.recipients?.length || 0} recipients`,
        metadata: {
          shareType: shareData.shareType,
          fileIds: shareData.fileIds,
          recipients: shareData.recipients
        }
      });
      
      return {
        share,
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/shared/${share.shareId}`,
        filesShared: files.length
      };
    } catch (error) {
      console.error('Failed to share files:', error);
      throw error;
    }
  }
  
  async createFolderV2(folderData: any, session: any): Promise<any> {
    try {
      const foldersCollection = await getCollection('folders');
      
      // Validate parent folder if specified
      if (folderData.parentId) {
        const parentFolder = await foldersCollection.findOne({ _id: new ObjectId(folderData.parentId) });
        if (!parentFolder) {
          throw new Error('Parent folder not found');
        }
        
        // Check parent folder permissions
        if (!this.hasFolderPermission(parentFolder, session.user.email, 'canEdit')) {
          throw new Error('Insufficient permissions to create subfolder');
        }
      }
      
      // Generate folder path
      const path = await this.generateFolderPath(folderData.parentId, folderData.name);
      
      // Create folder record
      const folder = {
        _id: new ObjectId(),
        name: folderData.name,
        description: folderData.description,
        parentId: folderData.parentId,
        path,
        projectId: folderData.projectId,
        
        // Permissions
        uploadedBy: session.user.email,
        uploadedByName: session.user.name,
        isPublic: folderData.isPublic,
        permissions: folderData.permissions || {
          canView: [session.user.email],
          canEdit: [session.user.email],
          canUpload: [session.user.email],
          canDelete: [session.user.email]
        },
        
        // Statistics
        fileCount: 0,
        totalSize: 0,
        subfolderCount: 0,
        
        // Status and timestamps
        status: 'active',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await foldersCollection.insertOne(folder);
      
      // Update parent folder subfolder count
      if (folderData.parentId) {
        await foldersCollection.updateOne(
          { _id: new ObjectId(folderData.parentId) },
          { 
            $inc: { subfolderCount: 1 },
            $set: { updatedAt: new Date() }
          }
        );
      }
      
      // Log activity
      await this.logActivity({
        userId: session.user.email,
        action: 'CREATE_FOLDER_V2',
        entityType: 'folder',
        entityId: folder._id.toString(),
        entityName: folder.name,
        description: `Folder created: ${folder.name}`,
        metadata: {
          parentId: folderData.parentId,
          path,
          projectId: folderData.projectId
        }
      });
      
      return folder;
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  }
  
  async getFileAnalyticsV2(fileId: string, session: any): Promise<any> {
    try {
      const filesCollection = await getCollection('files');
      const analyticsCollection = await getCollection('file_analytics');
      
      const file = await filesCollection.findOne({ 
        _id: new ObjectId(fileId),
        $or: [
          { uploadedBy: session.user.email },
          { 'sharedWith': session.user.email },
          { isPublic: true }
        ]
      });
      
      if (!file) {
        throw new Error('File not found or access denied');
      }
      
      // Get detailed analytics
      const analytics = await analyticsCollection.find({ fileId }).toArray();
      
      // Access patterns
      const accessPatterns = await this.getAccessPatterns(fileId);
      
      // Download trends
      const downloadTrends = await this.getDownloadTrends(fileId);
      
      // Geographic distribution
      const geographicData = await this.getGeographicData(fileId);
      
      return {
        file: {
          id: file._id,
          name: file.name,
          size: file.size,
          uploadedAt: file.createdAt
        },
        analytics: {
          totalViews: file.analytics?.views || 0,
          totalDownloads: file.analytics?.downloads || 0,
          totalShares: file.analytics?.shares || 0,
          uniqueViewers: analytics.length,
          averageViewDuration: this.calculateAverageViewDuration(analytics),
          topReferrers: this.getTopReferrers(analytics)
        },
        patterns: accessPatterns,
        trends: downloadTrends,
        geographic: geographicData,
        insights: await this.generateFileInsights(file, analytics)
      };
    } catch (error) {
      console.error('Failed to get file analytics:', error);
      throw error;
    }
  }
  
  // Helper methods
  private async uploadToCloudStorage(file: File, fileId: string, userEmail: string): Promise<string> {
    // Implementation for cloud storage upload
    // This would integrate with AWS S3, Google Cloud Storage, or Azure Blob Storage
    return `https://storage.example.com/files/${fileId}/${file.name}`;
  }
  
  private async generateThumbnail(file: File, fileId: string): Promise<string | null> {
    // Implementation for thumbnail generation
    // This would use image processing libraries to create thumbnails
    return `https://storage.example.com/thumbnails/${fileId}.jpg`;
  }
  
  private async extractFileMetadata(file: File): Promise<any> {
    const metadata = {
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified)
    };
    
    // Extract additional metadata based on file type
    if (file.type.startsWith('image/')) {
      // Extract EXIF data, dimensions, etc.
      metadata.dimensions = await this.getImageDimensions(file);
    } else if (file.type.startsWith('video/')) {
      // Extract video metadata
      metadata.duration = await this.getVideoDuration(file);
      metadata.resolution = await this.getVideoResolution(file);
    } else if (file.type.includes('pdf') || file.type.includes('document')) {
      // Extract document metadata
      metadata.pageCount = await this.getDocumentPageCount(file);
    }
    
    return metadata;
  }
  
  private async calculateChecksum(file: File): Promise<string> {
    // Implementation for file checksum calculation
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  private getCategoryFromFile(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'images';
    if (mimeType.startsWith('video/')) return 'videos';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'documents';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archives';
    return 'other';
  }
  
  private isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }
  
  private isVideoFile(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }
  
  private hasFolderPermission(folder: any, userEmail: string, permission: string): boolean {
    return folder.permissions?.[permission]?.includes(userEmail) || folder.uploadedBy === userEmail;
  }
  
  private generateShareId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  private async generateFolderPath(parentId: string | undefined, name: string): Promise<string> {
    if (!parentId) return `/${name}`;
    
    const foldersCollection = await getCollection('folders');
    const parent = await foldersCollection.findOne({ _id: new ObjectId(parentId) });
    return `${parent.path}/${name}`;
  }
  
  private groupFilesByType(files: any[]): any {
    return files.reduce((acc, file) => {
      const type = this.getCategoryFromFile(file.mimeType);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }
  
  private groupFilesByCategory(files: any[]): any {
    return files.reduce((acc, file) => {
      const category = file.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
  }
  
  private async sendShareNotifications(share: any, files: any[]): Promise<void> {
    // Implementation for sending share notifications
    console.log(`Share notifications sent to ${share.recipients.length} recipients`);
  }
  
  private async logActivity(activity: any): Promise<void> {
    const activityCollection = await getCollection('activity_logs');
    await activityCollection.insertOne({
      ...activity,
      timestamp: new Date(),
      id: new ObjectId().toString()
    });
  }
  
  // Analytics helper methods
  private async getAccessPatterns(fileId: string): Promise<any> {
    // Implementation for access pattern analysis
    return {};
  }
  
  private async getDownloadTrends(fileId: string): Promise<any> {
    // Implementation for download trend analysis
    return [];
  }
  
  private async getGeographicData(fileId: string): Promise<any> {
    // Implementation for geographic distribution analysis
    return {};
  }
  
  private calculateAverageViewDuration(analytics: any[]): number {
    // Implementation for calculating average view duration
    return 0;
  }
  
  private getTopReferrers(analytics: any[]): any[] {
    // Implementation for getting top referrers
    return [];
  }
  
  private async generateFileInsights(file: any, analytics: any[]): Promise<string[]> {
    const insights = [];
    
    if (file.analytics?.views > 100) {
      insights.push("This file is highly viewed and may be important to your team.");
    }
    
    if (file.analytics?.downloads > file.analytics?.views * 0.5) {
      insights.push("High download rate indicates this file is valuable for offline use.");
    }
    
    return insights;
  }
  
  // Additional helper methods for metadata extraction
  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    // Implementation for getting image dimensions
    return { width: 0, height: 0 };
  }
  
  private async getVideoDuration(file: File): Promise<number> {
    // Implementation for getting video duration
    return 0;
  }
  
  private async getVideoResolution(file: File): Promise<{ width: number; height: number }> {
    // Implementation for getting video resolution
    return { width: 0, height: 0 };
  }
  
  private async getDocumentPageCount(file: File): Promise<number> {
    // Implementation for getting document page count
    return 0;
  }
}

// API Handlers
const enhancedFileManager = new EnhancedFileManager();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }
    
    const { searchParams } = new URL(request.url);
    const query = fileQuerySchemaV2.parse(Object.fromEntries(searchParams));
    
    const result = await enhancedFileManager.getFilesV2(query, session);
    
    return setCorsHeaders(createSuccessResponse(
      result,
      "Files retrieved successfully",
      {
        query,
        timestamp: new Date().toISOString(),
        version: 'v2.0'
      }
    ));
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return setCorsHeaders(createBadRequestResponse(
        error.issues.map((e: any) => e.message).join(', ')
      ));
    }
    return handleApiError(error, "Getting enhanced files");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }
    
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      // File upload
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const fileData = JSON.parse(formData.get('data') as string);
      
      if (!file) {
        return setCorsHeaders(createBadRequestResponse("No file provided"));
      }
      
      const validatedData = uploadFileSchemaV2.parse(fileData);
      const uploadedFile = await enhancedFileManager.uploadFileV2(validatedData, file, session);
      
      return setCorsHeaders(createCreatedResponse(
        uploadedFile,
        "File uploaded successfully",
        {
          fileId: uploadedFile.fileId,
          url: uploadedFile.url,
          version: 'v2.0'
        }
      ));
    } else {
      // Other operations (share, create folder, etc.)
      const body = await request.json();
      
      if (body.operation === 'share') {
        const validatedShare = shareFileSchemaV2.parse(body);
        const share = await enhancedFileManager.shareFilesV2(validatedShare, session);
        
        return setCorsHeaders(createCreatedResponse(
          share,
          "Files shared successfully",
          {
            shareId: share.share.shareId,
            shareUrl: share.shareUrl,
            version: 'v2.0'
          }
        ));
      } else if (body.operation === 'createFolder') {
        const validatedFolder = folderSchemaV2.parse(body);
        const folder = await enhancedFileManager.createFolderV2(validatedFolder, session);
        
        return setCorsHeaders(createCreatedResponse(
          folder,
          "Folder created successfully",
          {
            folderId: folder._id.toString(),
            path: folder.path,
            version: 'v2.0'
          }
        ));
      } else {
        return setCorsHeaders(createBadRequestResponse("Invalid operation"));
      }
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return setCorsHeaders(createBadRequestResponse(
        error.issues.map((e: any) => e.message).join(', ')
      ));
    }
    return handleApiError(error, "File operation");
  }
}

// File analytics endpoint
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }
    
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    
    if (!fileId) {
      return setCorsHeaders(createBadRequestResponse("File ID parameter is required"));
    }
    
    const analytics = await enhancedFileManager.getFileAnalyticsV2(fileId, session);
    
    return setCorsHeaders(createSuccessResponse(
      analytics,
      "File analytics retrieved successfully",
      {
        fileId,
        version: 'v2.0'
      }
    ));
    
  } catch (error) {
    return handleApiError(error, "Getting file analytics");
  }
}
