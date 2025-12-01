import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { MongooseConfigModule } from "./db/mongoose.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { PostsModule } from "./modules/posts/posts.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { AdminModule } from "./modules/admin/admin.module";
import { EmailModule } from "./modules/email/email.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { 
  RequestIdMiddleware, 
  PerformanceMiddleware, 
  MemoryUsageMiddleware,
  SecurityHeadersMiddleware,
  CacheControlMiddleware,
  HealthCheckMiddleware,
  ApiDocsMiddleware
} from "./common/middleware/performance.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
    }),
    ThrottlerModule.forRoot([
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
    MongooseConfigModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    PostsModule,
    CommentsModule,
    AdminModule,
    EmailModule,
    NotificationsModule,
    AnalyticsModule,
    DashboardModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        RequestIdMiddleware,
        SecurityHeadersMiddleware,
        CacheControlMiddleware,
        MemoryUsageMiddleware,
        PerformanceMiddleware,
        HealthCheckMiddleware,
        ApiDocsMiddleware
      )
      .forRoutes('*');
  }
}
