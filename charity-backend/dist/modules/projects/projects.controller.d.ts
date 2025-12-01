import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createProjectDto: CreateProjectDto): Promise<{
        message: string;
        details: import("../../db/schemas/enhanced-project.schema").EnhancedProject;
    }>;
    findAll(): Promise<{
        message: string;
        details: import("../../db/schemas/enhanced-project.schema").EnhancedProject[];
    }>;
    findOne(id: string): Promise<{
        message: string;
        details: import("../../db/schemas/enhanced-project.schema").EnhancedProject;
    }>;
    update(id: string, updateProjectDto: UpdateProjectDto): Promise<{
        message: string;
        details: import("../../db/schemas/enhanced-project.schema").EnhancedProject;
    }>;
    remove(id: string): Promise<{
        message: string;
        details: {
            id: string;
        };
    }>;
}
