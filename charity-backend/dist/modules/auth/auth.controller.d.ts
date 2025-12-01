import { AuthService } from "./auth.service";
import { JwtPayload } from "./jwt-payload.interface";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: any): Promise<{
        message: string;
        details: {
            user: {
                id: any;
                name: any;
                email: any;
                role: import("../../common/enums/role.enum").Role;
                isActive: any;
                emailVerified: any;
            };
            tokens: {
                accessToken: string;
                refreshToken: string;
            };
        };
    }>;
    login(body: any): Promise<{
        message: string;
        details: {
            user: {
                id: any;
                name: any;
                email: any;
                role: import("../../common/enums/role.enum").Role;
                isActive: any;
                emailVerified: any;
            };
            tokens: {
                accessToken: string;
                refreshToken: string;
            };
        };
    }>;
    me(user: JwtPayload): Promise<{
        message: string;
        details: JwtPayload;
    }>;
    updateProfile(user: JwtPayload, body: any): Promise<{
        message: string;
        details: (import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>) | null;
    }>;
    changePassword(user: JwtPayload, body: any): Promise<{
        message: string;
        details: {
            id: string;
        };
    }>;
    changeEmail(user: JwtPayload, body: any): Promise<{
        message: string;
        details: {
            id: string;
            email: string;
        };
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
        details: {
            id: string;
            emailVerified: boolean;
        };
    }>;
}
