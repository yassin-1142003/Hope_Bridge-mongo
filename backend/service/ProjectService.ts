import type { Project, NewProject } from "@/backend/database/mongoose/models";
import { MongooseUOW } from "@/backend/database/mongoose/MongooseUOW";
import { AppError } from "@/backend/errorHandler";

class ProjectService {
  private uow: MongooseUOW;

  constructor(uow: MongooseUOW) {
    this.uow = uow;
  }

  async getAll(): Promise<Project[]> {
    return this.uow.projectRepo.getAll();
  }

  async saveOne(data: any): Promise<Project> {
    if (!data.bannerPhotoUrl) {
      throw new AppError("ERR_MISSING_PARAMETER", "bannerPhotoUrl is required", {});
    }

    const newProject: NewProject = {
      bannerPhotoUrl: data.bannerPhotoUrl,
      contents: data.contents ?? [],
    };

    return this.uow.projectRepo.saveOne(newProject);
  }

  async getOneById(id: string): Promise<Project> {
    if (!id) {
      throw new AppError("ERR_MISSING_PARAMETER", "id is required to fetch a project", {});
    }
    return this.uow.projectRepo.getOneById(id);
  }

  async updateOne(id: string, data: any): Promise<Project> {
    if (!id) {
      throw new AppError("ERR_MISSING_PARAMETER", "id is required to update a project", {});
    }

    const updates: Partial<NewProject> = {};

    if (typeof data.bannerPhotoUrl === "string") {
      updates.bannerPhotoUrl = data.bannerPhotoUrl;
    }

    if (Array.isArray(data.contents)) {
      updates.contents = data.contents;
    }

    if (!Object.keys(updates).length) {
      throw new AppError(
        "ERR_MISSING_PARAMETER",
        "At least one updatable field (bannerPhotoUrl or contents) must be provided.",
        {},
        400,
      );
    }

    return this.uow.projectRepo.updateOne(id, updates);
  }

  async deleteOneById(id: string): Promise<void> {
    if (!id) {
      throw new AppError("ERR_MISSING_PARAMETER", "id is required to delete a project", {});
    }
    await this.uow.projectRepo.deleteOneById(id);
  }
}

export { ProjectService };
