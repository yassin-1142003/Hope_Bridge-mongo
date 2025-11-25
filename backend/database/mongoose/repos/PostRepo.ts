import { ClientSession } from "mongoose";
import { AppError } from "@/backend/errorHandler";
import { NewPost, Post, PostModel, toPost } from "../models";
import { PostCategoryName } from "../enums";

class PostRepo {
  constructor(private session: ClientSession | null = null) {}

  async saveOne(post: NewPost): Promise<Post> {
    const [doc] = await PostModel.create([post], {
      session: this.session ?? undefined,
    });
    return toPost(doc);
  }

  async getAll(category?: PostCategoryName): Promise<Post[]> {
    const filter = category ? { category } : {};
    const docs = await PostModel.find(filter)
      .sort({ created_at: -1, _id: -1 })
      .lean()
      .session(this.session ?? undefined);
    return docs.map((doc: any) => toPost(doc as any));
  }

  async getOneById(id: string): Promise<Post> {
    const doc = await PostModel
      .findById(id)
      .lean()
      .session(this.session ?? undefined);
    if (!doc) {
      throw new AppError("ERR_NOT_FOUND", `Post with id ${id} was not found.`, { id });
    }
    return toPost(doc as any);
  }

  async updateOne(id: string, updates: Partial<NewPost>): Promise<Post> {
    const doc = await PostModel
      .findByIdAndUpdate(id, updates, {
        new: true,
        session: this.session ?? undefined,
      });
    if (!doc) {
      throw new AppError("ERR_NOT_FOUND", `Post with id ${id} was not found.`, { id });
    }
    return toPost(doc);
  }

  async deleteOneById(id: string): Promise<void> {
    const doc = await PostModel
      .findByIdAndDelete(id)
      .session(this.session ?? undefined);
    if (!doc) {
      throw new AppError("ERR_NOT_FOUND", `Post with id ${id} was not found.`, { id });
    }
  }
}

export { PostRepo };
