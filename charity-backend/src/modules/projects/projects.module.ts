import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EnhancedProject, EnhancedProjectSchema } from "../../db/schemas/enhanced-project.schema";
import { EnhancedProjectService } from "./enhanced-project.service";
import { EnhancedProjectController } from "./enhanced-project.controller";
import { ProjectsService } from "./projects.service";
import { ProjectsController } from "./projects.controller";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EnhancedProject.name, schema: EnhancedProjectSchema }]),
  ],
  controllers: [EnhancedProjectController, ProjectsController],
  providers: [EnhancedProjectService, ProjectsService],
  exports: [EnhancedProjectService, ProjectsService],
})
export class ProjectsModule {}
