import { Model } from "mongoose";
import { EnhancedProject } from "../../db/schemas/enhanced-project.schema";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
export declare class ProjectsService {
    private readonly projectModel;
    constructor(projectModel: Model<EnhancedProject>);
    create(data: CreateProjectDto): Promise<EnhancedProject>;
    findAll(): Promise<EnhancedProject[]>;
    findOne(id: string): Promise<EnhancedProject>;
    update(id: string, data: UpdateProjectDto): Promise<EnhancedProject>;
    remove(id: string): Promise<void>;
}
