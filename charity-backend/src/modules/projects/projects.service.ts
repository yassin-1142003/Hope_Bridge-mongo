import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Project, ProjectDocument } from "../../db/schemas/project.schema";
import {
  CreateProjectDto,
  UpdateProjectDto,
} from "./projects.zod";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async create(data: CreateProjectDto): Promise<Project> {
    const doc = new this.projectModel(data);
    return doc.save();
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel
      .find()
      .sort({ createdAt: -1, _id: -1 })
      .lean()
      .exec();
  }

  async findOne(id: string): Promise<Project> {
    const doc = await this.projectModel.findById(id).lean().exec();
    if (!doc) {
      throw new NotFoundException("Project not found");
    }
    return doc as any;
  }

  async update(id: string, data: UpdateProjectDto): Promise<Project> {
    const doc = await this.projectModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec();
    if (!doc) {
      throw new NotFoundException("Project not found");
    }
    return doc as any;
  }

  async remove(id: string): Promise<void> {
    const res = await this.projectModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException("Project not found");
    }
  }
}
