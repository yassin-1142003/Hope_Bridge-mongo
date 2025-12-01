"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const users_service_1 = require("../users/users.service");
const role_enum_1 = require("../../common/enums/role.enum");
let AuthService = class AuthService {
    constructor(usersService, jwtService, config) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.config = config;
    }
    toAuthUser(user) {
        var _a, _b, _c;
        return {
            id: (_c = (_b = (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
        };
    }
    async signTokens(user) {
        var _a, _b, _c, _d;
        const payload = {
            sub: (_c = (_b = (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.config.get("JWT_REFRESH_SECRET"),
            expiresIn: (_d = this.config.get("JWT_REFRESH_EXPIRES_IN")) !== null && _d !== void 0 ? _d : "7d",
        });
        return { accessToken, refreshToken };
    }
    async register(data) {
        const email = data.email.toLowerCase();
        const user = await this.usersService.createUser({
            name: data.name,
            email,
            passwordHash: await bcrypt.hash(data.password, 10),
            role: role_enum_1.Role.USER,
        });
        const tokens = await this.signTokens(user);
        return {
            user: this.toAuthUser(user),
            tokens,
        };
    }
    async login(data) {
        const email = data.email.toLowerCase();
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        const ok = await bcrypt.compare(data.password, user.passwordHash);
        if (!ok) {
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException("User is inactive");
        }
        const tokens = await this.signTokens(user);
        return {
            user: this.toAuthUser(user),
            tokens,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map