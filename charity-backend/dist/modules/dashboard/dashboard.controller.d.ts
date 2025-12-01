import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getAdminDashboard(): Promise<{
        success: boolean;
        data: {
            overview: {
                totalProjects: number;
                activeProjects: number;
                completedProjects: number;
                projectCompletionRate: number;
                totalUsers: number;
                activeUsers: number;
                userEngagementRate: number;
            };
            financials: {
                totalDonations: number;
                monthlyDonations: any;
                yearlyDonations: any;
                avgDonation: number;
            };
            tasks: {
                totalTasks: number;
                completedTasks: number;
                pendingTasks: number;
                taskCompletionRate: number;
            };
            recent: {
                projects: (import("mongoose").Document<unknown, {}, import("../../db/schemas/enhanced-project.schema").EnhancedProject, {}, {}> & import("../../db/schemas/enhanced-project.schema").EnhancedProject & {
                    _id: import("mongoose").Types.ObjectId;
                } & {
                    __v: number;
                })[];
                topDonors: any[];
                activity: (import("mongoose").Document<unknown, {}, import("../../db/schemas/enhanced-project.schema").EnhancedProject, {}, {}> & import("../../db/schemas/enhanced-project.schema").EnhancedProject & {
                    _id: import("mongoose").Types.ObjectId;
                } & {
                    __v: number;
                })[];
            };
            charts: {
                projectStatus: {
                    active: number;
                    completed: number;
                    pending: number;
                };
                userActivity: {
                    active: number;
                    inactive: number;
                };
                taskStatus: {
                    completed: number;
                    pending: number;
                    inProgress: number;
                };
            };
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: string;
        data?: undefined;
    }>;
    getUserDashboard(req: any): Promise<{
        success: boolean;
        data: {
            user: (import("mongoose").Document<unknown, {}, import("../../db/schemas/enhanced-user.schema").EnhancedUser, {}, {}> & import("../../db/schemas/enhanced-user.schema").EnhancedUser & {
                _id: import("mongoose").Types.ObjectId;
            } & {
                __v: number;
            }) | null;
            stats: {
                projectsCreated: number;
                projectsVolunteered: number;
                totalDonated: number;
                donationsCount: number;
                tasksAssigned: number;
                tasksCompleted: number;
            };
            projects: (import("mongoose").Document<unknown, {}, import("../../db/schemas/enhanced-project.schema").EnhancedProject, {}, {}> & import("../../db/schemas/enhanced-project.schema").EnhancedProject & {
                _id: import("mongoose").Types.ObjectId;
            } & {
                __v: number;
            })[];
            donations: (import("mongoose").Document<unknown, {}, import("../../db/schemas/donation.schema").Donation, {}, {}> & import("../../db/schemas/donation.schema").Donation & {
                _id: import("mongoose").Types.ObjectId;
            } & {
                __v: number;
            })[];
            tasks: (import("mongoose").Document<unknown, {}, import("../../db/schemas/task.schema").Task, {}, {}> & import("../../db/schemas/task.schema").Task & {
                _id: import("mongoose").Types.ObjectId;
            } & {
                __v: number;
            })[];
            recommended: (import("mongoose").Document<unknown, {}, import("../../db/schemas/enhanced-project.schema").EnhancedProject, {}, {}> & import("../../db/schemas/enhanced-project.schema").EnhancedProject & {
                _id: import("mongoose").Types.ObjectId;
            } & {
                __v: number;
            })[];
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: string;
        data?: undefined;
    }>;
    getProjectDashboard(projectId: string, req: any): Promise<{
        success: boolean;
        data: {
            project: import("mongoose").Document<unknown, {}, import("../../db/schemas/enhanced-project.schema").EnhancedProject, {}, {}> & import("../../db/schemas/enhanced-project.schema").EnhancedProject & {
                _id: import("mongoose").Types.ObjectId;
            } & {
                __v: number;
            };
            stats: {
                totalDonated: number;
                uniqueDonors: number;
                donationsCount: number;
                avgDonation: number;
                progressPercentage: number;
                totalVolunteers: number;
                totalTasks: number;
                completedTasks: number;
                taskCompletionRate: number;
            };
            donations: (import("mongoose").Document<unknown, {}, import("../../db/schemas/donation.schema").Donation, {}, {}> & import("../../db/schemas/donation.schema").Donation & {
                _id: import("mongoose").Types.ObjectId;
            } & {
                __v: number;
            })[];
            tasks: (import("mongoose").Document<unknown, {}, import("../../db/schemas/task.schema").Task, {}, {}> & import("../../db/schemas/task.schema").Task & {
                _id: import("mongoose").Types.ObjectId;
            } & {
                __v: number;
            })[];
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: string;
        data?: undefined;
    }>;
    getOverviewStats(period?: string): Promise<{
        success: boolean;
        data: {
            period: string;
            overview: {
                totalProjects: number;
                activeProjects: number;
                completedProjects: number;
                projectCompletionRate: number;
                totalUsers: number;
                activeUsers: number;
                userEngagementRate: number;
            };
            financials: {
                totalDonations: number;
                monthlyDonations: any;
                yearlyDonations: any;
                avgDonation: number;
            };
            tasks: {
                totalTasks: number;
                completedTasks: number;
                pendingTasks: number;
                taskCompletionRate: number;
            };
            recent: {
                projects: (import("mongoose").Document<unknown, {}, import("../../db/schemas/enhanced-project.schema").EnhancedProject, {}, {}> & import("../../db/schemas/enhanced-project.schema").EnhancedProject & {
                    _id: import("mongoose").Types.ObjectId;
                } & {
                    __v: number;
                })[];
                topDonors: any[];
                activity: (import("mongoose").Document<unknown, {}, import("../../db/schemas/enhanced-project.schema").EnhancedProject, {}, {}> & import("../../db/schemas/enhanced-project.schema").EnhancedProject & {
                    _id: import("mongoose").Types.ObjectId;
                } & {
                    __v: number;
                })[];
            };
            charts: {
                projectStatus: {
                    active: number;
                    completed: number;
                    pending: number;
                };
                userActivity: {
                    active: number;
                    inactive: number;
                };
                taskStatus: {
                    completed: number;
                    pending: number;
                    inProgress: number;
                };
            };
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: string;
        data?: undefined;
    }>;
}
