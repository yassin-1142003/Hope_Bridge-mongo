import { AnalyticsService, VisitDocument } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    trackVisit(visitData: any): Promise<{
        success: boolean;
        message: string;
        data: {
            success: boolean;
            visitId: import("mongoose").Types.ObjectId;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: string;
        data?: undefined;
    }>;
    getProjectAnalytics(projectId: string, timeframe?: 'day' | 'week' | 'month' | 'year'): Promise<{
        success: boolean;
        data: {
            projectId: string;
            timeframe: "day" | "week" | "month" | "year";
            data: any[];
            summary: {
                totalVisits: any;
                totalUniqueUsers: any;
                avgDuration: number;
            };
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: string;
        data: null;
    }>;
    getUserVisitHistory(userId: string, limit?: number): Promise<{
        success: boolean;
        data: VisitDocument[] | null;
        message?: string;
        error?: string;
    }>;
    getDashboardAnalytics(): Promise<{
        success: boolean;
        data: any | null;
        message?: string;
        error?: string;
    }>;
}
