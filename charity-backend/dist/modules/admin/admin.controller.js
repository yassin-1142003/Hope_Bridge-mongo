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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const users_service_1 = require("../users/users.service");
const projects_service_1 = require("../projects/projects.service");
const posts_service_1 = require("../posts/posts.service");
const comments_service_1 = require("../comments/comments.service");
let AdminController = class AdminController {
    constructor(usersService, projectsService, postsService, commentsService) {
        this.usersService = usersService;
        this.projectsService = projectsService;
        this.postsService = postsService;
        this.commentsService = commentsService;
    }
    async overview() {
        const [users, projects, posts] = await Promise.all([
            this.usersService.findAll(),
            this.projectsService.findAll(),
            this.postsService.findAll(),
        ]);
        return {
            message: "Admin overview",
            details: {
                userCount: users.length,
                projectCount: projects.length,
                postCount: posts.length,
            },
        };
    }
    async allUsers() {
        const users = await this.usersService.findAll();
        return { message: "All users (admin)", details: users };
    }
    async allProjects() {
        const projects = await this.projectsService.findAll();
        return { message: "All projects (admin)", details: projects };
    }
    async allPosts() {
        const posts = await this.postsService.findAll();
        return { message: "All posts (admin)", details: posts };
    }
    async commentsTree(postId) {
        const tree = await this.commentsService.findTreeByPostId(postId);
        return { message: "Comments tree (admin)", details: tree };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)("overview"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)("users"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "allUsers", null);
__decorate([
    (0, common_1.Get)("projects"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "allProjects", null);
__decorate([
    (0, common_1.Get)("posts"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "allPosts", null);
__decorate([
    (0, common_1.Get)("comments/post/:postId/tree"),
    __param(0, (0, common_1.Param)("postId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "commentsTree", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)("admin"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, common_1.Controller)("admin"),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        projects_service_1.ProjectsService,
        posts_service_1.PostsService,
        comments_service_1.CommentsService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map