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
import { CommentsService, CommentNode } from "./comments.service";
import {
  CreateCommentSchema,
  UpdateCommentSchema,
} from "./comments.zod";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";

@ApiTags("comments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @HttpPost()
  async create(@Body() body: any) {
    const dto = CreateCommentSchema.parse(body);
    const created = await this.commentsService.create(dto);
    return { message: "Comment created", details: created };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const comment = await this.commentsService.findOne(id);
    return { message: "Comment fetched", details: comment };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: any) {
    const dto = UpdateCommentSchema.parse(body);
    const updated = await this.commentsService.update(id, dto);
    return { message: "Comment updated", details: updated };
  }

  @Patch(":id/freeze")
  async freeze(@Param("id") id: string) {
    const frozen = await this.commentsService.freeze(id);
    return { message: "Comment frozen", details: frozen };
  }

  @Patch(":id/soft-delete")
  async softDelete(@Param("id") id: string) {
    const deleted = await this.commentsService.removeSoft(id);
    return { message: "Comment soft deleted", details: deleted };
  }

  @Delete(":id")
  async hardDelete(@Param("id") id: string) {
    await this.commentsService.removeHard(id);
    return { message: "Comment hard deleted", details: { id } };
  }

  @Get("post/:postId/tree")
  async getTree(@Param("postId") postId: string) {
    const tree = await this.commentsService.findTreeByPostId(postId);
    return { message: "Comments tree fetched", details: tree };
  }
}
