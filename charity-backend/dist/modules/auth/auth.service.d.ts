import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { Role } from "../../common/enums/role.enum";
import { RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto, ChangeEmailDto } from "./auth.zod";
import { EmailService } from "../email/email.service";
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly config;
    private readonly emailService;
    constructor(usersService: UsersService, jwtService: JwtService, config: ConfigService, emailService: EmailService);
    private toAuthUser;
    private signTokens;
    private signEmailVerificationToken;
    register(data: RegisterDto): Promise<{
        user: {
            id: any;
            name: any;
            email: any;
            role: Role;
            isActive: any;
            emailVerified: any;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    login(data: LoginDto): Promise<{
        user: {
            id: any;
            name: any;
            email: any;
            role: Role;
            isActive: any;
            emailVerified: any;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    updateProfile(userId: string, data: UpdateProfileDto): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    changePassword(userId: string, data: ChangePasswordDto): Promise<{
        id: string;
    }>;
    changeEmail(userId: string, data: ChangeEmailDto): Promise<{
        id: string;
        email: string;
    }>;
    verifyEmailToken(token: string): Promise<{
        id: string;
        emailVerified: boolean;
    }>;
}
