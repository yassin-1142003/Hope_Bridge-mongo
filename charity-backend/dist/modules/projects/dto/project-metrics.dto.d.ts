import { ProjectCategory, ProjectStatus } from '../../../db/schemas/enhanced-project.schema';
export declare class ProjectMetricsDto {
    startDate?: Date;
    endDate?: Date;
    category?: ProjectCategory;
    status?: ProjectStatus;
    groupBy?: string;
    includeDetails?: boolean;
}
