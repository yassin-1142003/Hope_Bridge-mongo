"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const mongoose_module_1 = require("./db/mongoose.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const projects_module_1 = require("./modules/projects/projects.module");
const posts_module_1 = require("./modules/posts/posts.module");
const comments_module_1 = require("./modules/comments/comments.module");
const admin_module_1 = require("./modules/admin/admin.module");
const email_module_1 = require("./modules/email/email.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const performance_middleware_1 = require("./common/middleware/performance.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(performance_middleware_1.RequestIdMiddleware, performance_middleware_1.SecurityHeadersMiddleware, performance_middleware_1.CacheControlMiddleware, performance_middleware_1.MemoryUsageMiddleware, performance_middleware_1.PerformanceMiddleware, performance_middleware_1.HealthCheckMiddleware, performance_middleware_1.ApiDocsMiddleware)
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                cache: true,
                expandVariables: true,
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: "global",
                    ttl: 60000,
                    limit: 100,
                },
                {
                    name: "strict",
                    ttl: 60000,
                    limit: 20,
                },
            ]),
            mongoose_module_1.MongooseConfigModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            projects_module_1.ProjectsModule,
            posts_module_1.PostsModule,
            comments_module_1.CommentsModule,
            admin_module_1.AdminModule,
            email_module_1.EmailModule,
            notifications_module_1.NotificationsModule,
            analytics_module_1.AnalyticsModule,
            dashboard_module_1.DashboardModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map