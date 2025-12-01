import { Model, Types } from 'mongoose';
import { EnhancedProject } from '../../db/schemas/enhanced-project.schema';
import { EnhancedUser } from '../../db/schemas/enhanced-user.schema';
export interface VisitDocument {
    projectId: string;
    userId?: string;
    path: string;
    locale: string;
    referrer: string;
    userAgent: string;
    userType: 'user' | 'guest';
    timestamp: Date;
    duration: number;
    sessionId: string;
    metadata: any;
}
export declare class AnalyticsService {
    private visitModel;
    private projectModel;
    private userModel;
    constructor(visitModel: Model<VisitDocument>, projectModel: Model<EnhancedProject>, userModel: Model<EnhancedUser>);
    trackVisit(visitData: Partial<VisitDocument>): Promise<{
        success: boolean;
        visitId: Types.ObjectId;
    }>;
    getProjectAnalytics(projectId: string, timeframe?: 'day' | 'week' | 'month' | 'year'): Promise<{
        projectId: string;
        timeframe: "day" | "week" | "month" | "year";
        data: any[];
        summary: {
            totalVisits: any;
            totalUniqueUsers: any;
            avgDuration: number;
        };
    }>;
    getUserVisitHistory(userId: string, limit?: number): Promise<(import("mongoose").Document<unknown, {}, VisitDocument, {}, {}> & VisitDocument & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getDashboardAnalytics(): Promise<{
        overview: {
            totalVisits: number;
            uniqueUsers: number;
            avgSessionDuration: number;
        };
        popularProjects: any[];
        recentActivity: (import("mongoose").Document<unknown, {}, VisitDocument, {}, {}> & VisitDocument & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    private getAvgSessionDuration;
}
