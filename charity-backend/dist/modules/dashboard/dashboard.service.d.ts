import { Model, Types } from 'mongoose';
import { EnhancedProject } from '../../db/schemas/enhanced-project.schema';
import { EnhancedUser } from '../../db/schemas/enhanced-user.schema';
import { Donation } from '../../db/schemas/donation.schema';
import { Task } from '../../db/schemas/task.schema';
export declare class DashboardService {
    private projectModel;
    private userModel;
    private donationModel;
    private taskModel;
    constructor(projectModel: Model<EnhancedProject>, userModel: Model<EnhancedUser>, donationModel: Model<Donation>, taskModel: Model<Task>);
    getDashboardStats(userId?: string): Promise<{
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
            projects: (import("mongoose").Document<unknown, {}, EnhancedProject, {}, {}> & EnhancedProject & {
                _id: Types.ObjectId;
            } & {
                __v: number;
            })[];
            topDonors: any[];
            activity: (import("mongoose").Document<unknown, {}, EnhancedProject, {}, {}> & EnhancedProject & {
                _id: Types.ObjectId;
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
    }>;
    getUserDashboard(userId: string): Promise<{
        user: (import("mongoose").Document<unknown, {}, EnhancedUser, {}, {}> & EnhancedUser & {
            _id: Types.ObjectId;
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
        projects: (import("mongoose").Document<unknown, {}, EnhancedProject, {}, {}> & EnhancedProject & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
        donations: (import("mongoose").Document<unknown, {}, Donation, {}, {}> & Donation & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
        tasks: (import("mongoose").Document<unknown, {}, Task, {}, {}> & Task & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
        recommended: (import("mongoose").Document<unknown, {}, EnhancedProject, {}, {}> & EnhancedProject & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    getProjectAnalytics(projectId: string): Promise<{
        project: import("mongoose").Document<unknown, {}, EnhancedProject, {}, {}> & EnhancedProject & {
            _id: Types.ObjectId;
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
        donations: (import("mongoose").Document<unknown, {}, Donation, {}, {}> & Donation & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
        tasks: (import("mongoose").Document<unknown, {}, Task, {}, {}> & Task & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
}
