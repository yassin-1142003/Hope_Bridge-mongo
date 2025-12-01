import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { EnhancedProject } from "../../db/schemas/enhanced-project.schema";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(EnhancedProject.name)
    private readonly projectModel: Model<EnhancedProject>,
  ) {}

  async create(data: CreateProjectDto): Promise<EnhancedProject> {
    const doc = new this.projectModel(data);
    return doc.save();
  }

  async findAll(): Promise<EnhancedProject[]> {
    return this.projectModel
      .find()
      .sort({ createdAt: -1, _id: -1 })
      .lean()
      .exec();
  }

  async findOne(id: string): Promise<EnhancedProject> {
    const doc = await this.projectModel.findById(id).lean().exec();
    if (!doc) {
      throw new NotFoundException("Project not found");
    }
    return doc as EnhancedProject;
  }

  async update(id: string, data: UpdateProjectDto): Promise<EnhancedProject> {
    const doc = await this.projectModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec();
    if (!doc) {
      throw new NotFoundException("Project not found");
    }
    return doc as EnhancedProject;
  }

  async remove(id: string): Promise<void> {
    const res = await this.projectModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException("Project not found");
    }
  }
}
