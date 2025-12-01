import { ProjectStatus, ProjectCategory } from '../../../db/schemas/enhanced-project.schema';
export declare class CreateProjectDto {
    bannerPhotoUrl: string;
    imageGallery?: string[];
    videoGallery?: string[];
    contents: ProjectContentDto[];
    status?: ProjectStatus;
    category: ProjectCategory;
    slug: string;
    targetAmount: number;
    currency?: string;
    startDate: Date;
    endDate: Date;
    location: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
    projectManager?: string;
    teamMembers?: string[];
    priority?: string;
    isFeatured?: boolean;
    isVisible?: boolean;
    tags?: string[];
    skills?: string[];
    externalLinks?: string[];
    websiteUrl?: string;
    socialMediaUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    documents?: string[];
}
export declare class ProjectContentDto {
    language_code: string;
    title: string;
    description: string;
    content: string;
    images?: string[];
    videos?: string[];
    documents?: string[];
    tags?: string[];
    metaDescription?: string;
    metaKeywords?: string;
}
