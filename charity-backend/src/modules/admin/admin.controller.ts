import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";
import { UsersService } from "../users/users.service";
import { ProjectsService } from "../projects/projects.service";
import { PostsService } from "../posts/posts.service";
import { CommentsService, CommentNode } from "../comments/comments.service";

@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller("admin")
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly projectsService: ProjectsService,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get("overview")
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

  @Get("users")
  async allUsers() {
    const users = await this.usersService.findAll();
    return { message: "All users (admin)", details: users };
  }

  @Get("projects")
  async allProjects() {
    const projects = await this.projectsService.findAll();
    return { message: "All projects (admin)", details: projects };
  }

  @Get("posts")
  async allPosts() {
    const posts = await this.postsService.findAll();
    return { message: "All posts (admin)", details: posts };
  }

  @Get("comments/post/:postId/tree")
  async commentsTree(@Param("postId") postId: string) {
    const tree = await this.commentsService.findTreeByPostId(postId);
    return { message: "Comments tree (admin)", details: tree };
  }
}
