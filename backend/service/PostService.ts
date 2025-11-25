import type { Post, NewPost } from "@/backend/database/mongoose/models";
import { PostCategoryName } from "@/backend/database/mongoose/enums";
import { MongooseUOW } from "@/backend/database/mongoose/MongooseUOW";
import { AppError } from "@/backend/errorHandler";

class PostService {
  private uow: MongooseUOW;

  constructor(uow: MongooseUOW) {
    this.uow = uow;
  }

  async getAll(category?: PostCategoryName): Promise<Post[]> {
    return this.uow.postRepo.getAll(category);
  }

  async saveOne(data: any): Promise<Post> {
    if (!data?.category) {
      throw new AppError("ERR_MISSING_PARAMETER", "category is required", {});
    }

    if (!Array.isArray(data?.contents) || data.contents.length === 0) {
      throw new AppError("ERR_MISSING_PARAMETER", "At least one content block is required.", {});
    }

    const newPost: NewPost = {
      category: data.category,
      contents: data.contents ?? [],
      images: data.images ?? [],
      videos: data.videos ?? [],
    };
    return this.uow.postRepo.saveOne(newPost);
  }

  async getOneById(id: string): Promise<Post> {
    if (!id) {
      throw new AppError("ERR_MISSING_PARAMETER", "id is required to fetch a post", {});
    }
    return this.uow.postRepo.getOneById(id);
  }

  async updateOne(id: string, data: any): Promise<Post> {
    if (!id) {
      throw new AppError("ERR_MISSING_PARAMETER", "id is required for update", { id });
    }

    const updates: Partial<NewPost> = {};

    if (data.category) {
      updates.category = data.category;
    }

    if (Array.isArray(data.contents)) {
      updates.contents = data.contents;
    }

    if (Array.isArray(data.images)) {
      updates.images = data.images;
    }

    if (Array.isArray(data.videos)) {
      updates.videos = data.videos;
    }

    if (!Object.keys(updates).length) {
      throw new AppError(
        "ERR_MISSING_PARAMETER",
        "No updatable post fields were provided.",
        {},
        400,
      );
    }

    return this.uow.postRepo.updateOne(id, updates);
  }

  async deleteOneById(id: string): Promise<void> {
    if (!id) {
      throw new AppError("ERR_MISSING_PARAMETER", "id is required to delete a post", {});
    }
    await this.uow.postRepo.deleteOneById(id);
  }
}

export { PostService };
