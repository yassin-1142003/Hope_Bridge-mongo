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
}
