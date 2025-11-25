import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { Role } from "../../common/enums/role.enum";
import { RegisterDto, LoginDto } from "./auth.zod";
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly config;
    constructor(usersService: UsersService, jwtService: JwtService, config: ConfigService);
    private toAuthUser;
    private signTokens;
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
}
