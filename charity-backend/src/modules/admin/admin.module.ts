import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { ProjectsModule } from "../projects/projects.module";
import { PostsModule } from "../posts/posts.module";
import { CommentsModule } from "../comments/comments.module";
import { AdminController } from "./admin.controller";

@Module({
  imports: [UsersModule, ProjectsModule, PostsModule, CommentsModule],
  controllers: [AdminController],
})
export class AdminModule {}
