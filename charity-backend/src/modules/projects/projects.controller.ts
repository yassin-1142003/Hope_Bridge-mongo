import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ThrottlerGuard } from "@nestjs/throttler";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
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
  async create(@Body() createProjectDto: CreateProjectDto) {
    const created = await this.projectsService.create(createProjectDto);
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
  async update(@Param("id") id: string, @Body() updateProjectDto: UpdateProjectDto) {
    const updated = await this.projectsService.update(id, updateProjectDto);
    return { message: "Project updated", details: updated };
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.projectsService.remove(id);
    return { message: "Project removed", details: { id } };
  }
}
