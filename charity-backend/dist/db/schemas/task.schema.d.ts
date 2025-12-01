import { HydratedDocument, Types } from "mongoose";
export type TaskDocument = HydratedDocument<Task>;
export declare enum TaskStatus {
    TODO = "todo",
    IN_PROGRESS = "in_progress",
    IN_REVIEW = "in_review",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    ON_HOLD = "on_hold"
}
export declare enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent",
    CRITICAL = "critical"
}
export declare enum TaskCategory {
    DEVELOPMENT = "development",
    DESIGN = "design",
    MARKETING = "marketing",
    ADMIN = "admin",
    FINANCE = "finance",
    OPERATIONS = "operations",
    FUNDRAISING = "fundraising",
    VOLUNTEER_MANAGEMENT = "volunteer_management",
    CONTENT_CREATION = "content_creation",
    EVENT_PLANNING = "event_planning",
    COMMUNICATION = "communication",
    RESEARCH = "research",
    OTHER = "other"
}
export declare class Task {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    category: TaskCategory;
    assignedTo?: Types.ObjectId;
    createdBy: Types.ObjectId;
    watchers: Types.ObjectId[];
    reviewedBy?: Types.ObjectId;
    project?: Types.ObjectId;
    dueDate?: Date;
    startDate?: Date;
    completedAt?: Date;
    reviewedAt?: Date;
    estimatedHours: number;
    actualHours: number;
    progressPercentage: number;
    dependencies: Types.ObjectId[];
    blocks: Types.ObjectId[];
    tags: string[];
    labels: string[];
    requiredSkills: string[];
    isLocationBased: boolean;
    location?: string;
    latitude?: number;
    longitude?: number;
    isVolunteerTask: boolean;
    volunteerSlotsNeeded: number;
    volunteerAssignees: Types.ObjectId[];
    attachments: string[];
    resources: string[];
    links: string[];
    checklist: Array<{
        title: string;
        completed: boolean;
        completedBy?: Types.ObjectId;
        completedAt?: Date;
        createdAt: Date;
    }>;
    comments: Array<{
        content: string;
        author: Types.ObjectId;
        createdAt: Date;
        updatedAt?: Date;
        isEdited: boolean;
        attachments: string[];
    }>;
    timeEntries: Array<{
        user: Types.ObjectId;
        hours: number;
        description?: string;
        date: Date;
        createdAt: Date;
    }>;
    requiresApproval: boolean;
    approvedBy?: Types.ObjectId;
    approvedAt?: Date;
    approvalNotes?: string;
    isRecurring: boolean;
    recurringFrequency?: string;
    nextOccurrence?: Date;
    recurringEndDate?: Date;
    sendNotifications: boolean;
    notificationRecipients: string[];
    isVisible: boolean;
    visibleToRoles: string[];
    visibleToUsers: Types.ObjectId[];
    isDeleted: boolean;
    deletedAt?: Date;
    deletedBy?: Types.ObjectId;
    activityLog: Array<{
        action: string;
        description: string;
        userId: Types.ObjectId;
        timestamp: Date;
        details?: any;
    }>;
}
export declare const TaskSchema: import("mongoose").Schema<Task, import("mongoose").Model<Task, any, any, any, import("mongoose").Document<unknown, any, Task, any, {}> & Task & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Task, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Task>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Task> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
