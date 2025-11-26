import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post as HttpPost,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PostsService } from "./posts.service";
import { CreatePostSchema, UpdatePostSchema } from "./posts.zod";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";

@ApiTags("posts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @HttpPost()
  async create(@Body() body: any) {
    const dto = CreatePostSchema.parse(body);
    const created = await this.postsService.create(dto);
    return { message: "Post created", details: created };
  }

  @Get()
  async findAll() {
    const posts = await this.postsService.findAll();
    return { message: "Posts fetched", details: posts };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const post = await this.postsService.findOne(id);
    return { message: "Post fetched", details: post };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: any) {
    const dto = UpdatePostSchema.parse(body);
    const updated = await this.postsService.update(id, dto);
    return { message: "Post updated", details: updated };
  }

  @Patch(":id/freeze")
  async freeze(@Param("id") id: string) {
    const frozen = await this.postsService.freeze(id);
    return { message: "Post frozen", details: frozen };
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.postsService.remove(id);
    return { message: "Post removed", details: { id } };
  }
}
