import { HydratedDocument, Types } from "mongoose";
export declare enum ProjectStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    COMPLETED = "completed",
    SUSPENDED = "suspended",
    CANCELLED = "cancelled"
}
export declare enum ProjectCategory {
    EDUCATION = "education",
    HEALTH = "health",
    FOOD = "food",
    SHELTER = "shelter",
    WATER = "water",
    EMERGENCY = "emergency",
    INFRASTRUCTURE = "infrastructure",
    AGRICULTURE = "agriculture",
    TECHNOLOGY = "technology",
    OTHER = "other"
}
export declare class ProjectContent {
    language_code: string;
    title: string;
    description: string;
    content: string;
    images: string[];
    videos: string[];
    documents: string[];
    tags?: string[];
    metaDescription?: string;
    metaKeywords?: string;
}
export declare const ProjectContentSchema: import("mongoose").Schema<ProjectContent, import("mongoose").Model<ProjectContent, any, any, any, import("mongoose").Document<unknown, any, ProjectContent, any, {}> & ProjectContent & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProjectContent, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ProjectContent>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ProjectContent> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class EnhancedProject {
    bannerPhotoUrl: string;
    imageGallery: string[];
    videoGallery: string[];
    contents: ProjectContent[];
    status: ProjectStatus;
    category: ProjectCategory;
    slug: string;
    targetAmount: number;
    currentAmount: number;
    currency: string;
    donorCount: number;
    startDate: Date;
    endDate: Date;
    actualEndDate?: Date;
    location: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
    projectManager?: Types.ObjectId;
    teamMembers: Types.ObjectId[];
    volunteers: Types.ObjectId[];
    donors: Types.ObjectId[];
    beneficiariesCount: number;
    volunteerHours: number;
    completionPercentage: number;
    priority: string;
    isFeatured: boolean;
    isVisible: boolean;
    tags: string[];
    skills: string[];
    externalLinks: string[];
    websiteUrl?: string;
    socialMediaUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    documents: string[];
    reports: string[];
    certificates: string[];
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    approvedBy?: string;
    approvedAt?: Date;
    isDeleted: boolean;
    deletedAt?: Date;
    deletedBy?: Types.ObjectId;
    activityLog: Array<{
        action: string;
        description: string;
        userId: Types.ObjectId;
        timestamp: Date;
    }>;
}
export declare const EnhancedProjectSchema: import("mongoose").Schema<EnhancedProject, import("mongoose").Model<EnhancedProject, any, any, any, import("mongoose").Document<unknown, any, EnhancedProject, any, {}> & EnhancedProject & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EnhancedProject, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<EnhancedProject>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<EnhancedProject> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export type EnhancedProjectDocument = HydratedDocument<EnhancedProject>;
