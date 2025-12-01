import { HydratedDocument } from "mongoose";
import { Role } from "../../common/enums/role.enum";
export type UserDocument = HydratedDocument<EnhancedUser>;
export declare class EnhancedUser {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    isActive: boolean;
    emailVerified: boolean;
    phone?: string;
    address?: string;
    avatar?: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    passwordChangedAt: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    backupCodes?: string[];
    loginAttempts: number;
    lockUntil?: Date;
    lastLoginAt?: Date;
    lastLoginIP?: string;
    lastLoginUserAgent?: string;
    loginCount: number;
    preferredLanguage: string;
    theme: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
    isDeleted: boolean;
    deletedAt?: Date;
    deletedBy?: string;
    createdBy?: string;
    updatedBy?: string;
    activeSessions: Array<{
        sessionId: string;
        device: string;
        browser: string;
        ip: string;
        location: string;
        lastActivity: Date;
        createdAt: Date;
    }>;
    activityLog: Array<{
        action: string;
        description: string;
        ip: string;
        userAgent: string;
        timestamp: Date;
    }>;
}
export declare const EnhancedUserSchema: import("mongoose").Schema<EnhancedUser, import("mongoose").Model<EnhancedUser, any, any, any, import("mongoose").Document<unknown, any, EnhancedUser, any, {}> & EnhancedUser & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EnhancedUser, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<EnhancedUser>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<EnhancedUser> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export type EnhancedUserDocument = HydratedDocument<EnhancedUser>;
