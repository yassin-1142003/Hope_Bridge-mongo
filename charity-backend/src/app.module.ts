import { Module } from "@nestjs/common";
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: "global",
        ttl: 60000,
        limit: 100,
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
    // TODO: import other modules (donations, files, admin)
  ],
})
export class AppModule {}
