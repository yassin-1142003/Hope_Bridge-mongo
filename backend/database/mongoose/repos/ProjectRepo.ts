import { ClientSession } from "mongoose";
import { AppError } from "@/backend/errorHandler";
import { NewProject, Project, ProjectModel, toProject } from "../models";

class ProjectRepo {
  constructor(private session: ClientSession | null = null) {}

  async saveOne(project: NewProject): Promise<Project> {
    const projectWithId = { ...project, customId: -1 };
    const [doc] = await ProjectModel.create([projectWithId], {
      session: this.session ?? undefined,
    });
    return toProject(doc);
  }

  async getAll(): Promise<Project[]> {
    const docs = await ProjectModel.find()
      .sort({ created_at: -1, _id: -1 })
      .lean()
      .session(this.session ?? undefined);
    return docs.map((doc: any) => toProject(doc as any));
  }

  async getOneById(id: string): Promise<Project> {
    const doc = await ProjectModel.findById(id)
      .lean()
      .session(this.session ?? undefined);
    if (!doc) {
      throw new AppError("ERR_NOT_FOUND", `Project with id ${id} was not found.`, { id });
    }
    return toProject(doc as any);
  }

  async updateOne(id: string, updates: Partial<NewProject>): Promise<Project> {
    const doc = await ProjectModel.findByIdAndUpdate(id, updates, {
      new: true,
      session: this.session ?? undefined,
    });
    if (!doc) {
      throw new AppError("ERR_NOT_FOUND", `Project with id ${id} was not found.`, { id });
    }
    return toProject(doc);
  }

  async deleteOneById(id: string): Promise<void> {
    const doc = await ProjectModel
      .findByIdAndDelete(id)
      .session(this.session ?? undefined);
    if (!doc) {
      throw new AppError("ERR_NOT_FOUND", `Project with id ${id} was not found.`, { id });
    }
  }
}

export { ProjectRepo };
