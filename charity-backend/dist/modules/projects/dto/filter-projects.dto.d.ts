import { ProjectStatus, ProjectCategory } from '../../../db/schemas/enhanced-project.schema';
export declare class FilterProjectsDto {
    page?: number;
    limit?: number;
    category?: ProjectCategory;
    status?: ProjectStatus;
    featured?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    city?: string;
    country?: string;
    priority?: string;
    projectManager?: string;
    tags?: string[];
}
