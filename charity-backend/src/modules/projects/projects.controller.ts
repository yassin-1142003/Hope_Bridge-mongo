import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ProjectsService } from "./projects.service";
import {
  CreateProjectSchema,
  UpdateProjectSchema,
} from "./projects.zod";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";

@ApiTags("projects")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() body: any) {
    const dto = CreateProjectSchema.parse(body);
    const created = await this.projectsService.create(dto);
    return { message: "Project created", details: created };
  }

  @Get()
  async findAll() {
    const projects = await this.projectsService.findAll();
    return { message: "Projects fetched", details: projects };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const project = await this.projectsService.findOne(id);
    return { message: "Project fetched", details: project };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: any) {
    const dto = UpdateProjectSchema.parse(body);
    const updated = await this.projectsService.update(id, dto);
    return { message: "Project updated", details: updated };
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.projectsService.remove(id);
    return { message: "Project removed", details: { id } };
  }
}
