"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const users_repository_1 = require("./users.repository");
const role_enum_1 = require("../../common/enums/role.enum");
let UsersService = class UsersService {
    constructor(usersRepo) {
        this.usersRepo = usersRepo;
    }
    findByEmail(email) {
        return this.usersRepo.findByEmail(email);
    }
    findById(id) {
        return this.usersRepo.findById(id);
    }
    async createUser(params) {
        var _a;
        const existing = await this.usersRepo.findByEmail(params.email);
        if (existing) {
            throw new common_1.ConflictException("Email already in use");
        }
        const user = await this.usersRepo.create({
            name: params.name,
            email: params.email,
            passwordHash: params.passwordHash,
            role: (_a = params.role) !== null && _a !== void 0 ? _a : role_enum_1.Role.USER,
            isActive: true,
        });
        return user;
    }
    async findAll() {
        return this.usersRepo.findAll();
    }
    async ensureExists(id) {
        const user = await this.usersRepo.findById(id);
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        return user;
    }
    async updateUser(id, update) {
        await this.ensureExists(id);
        return this.usersRepo.updateById(id, update);
    }
    async removeUser(id) {
        await this.ensureExists(id);
        await this.usersRepo.deleteById(id);
        return { id };
    }
    async setUserActive(id, isActive) {
        await this.ensureExists(id);
        return this.usersRepo.updateById(id, { isActive });
    }
    async setEmailVerified(id, emailVerified) {
        await this.ensureExists(id);
        return this.usersRepo.updateById(id, { emailVerified });
    }
    async updatePassword(id, passwordHash) {
        await this.ensureExists(id);
        return this.usersRepo.updateById(id, { passwordHash });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository])
], UsersService);
//# sourceMappingURL=users.service.js.map