import {
  PostModel,
  Post,
  NewPost,
  toPost,
} from "@/backend/database/mongoose/models";
import { connectDb } from "@/backend/database/mongoose/connection";
import { PostCategoryName } from "@/backend/database/mongoose/enums";
import slugify from "slugify";

export class PostService {
  async createPost(data: NewPost): Promise<Post> {
    await connectDb();
    if (!data.slug && data.contents?.length) {
      const base = data.contents[0]?.name ?? "post";
      data.slug = slugify(base, { lower: true, strict: true });
    }
    const post = new PostModel(data);
    const savedPost = await post.save();
    return toPost(savedPost);
  }

  async getAllPosts(category?: PostCategoryName): Promise<Post[]> {
    await connectDb();
    const filter: Record<string, unknown> = {};
    if (category) {
      filter.category = category;
    }
    const posts = await PostModel.find(filter).sort({ created_at: -1 });
    return posts.map(toPost);
  }

  async getPostById(id: string): Promise<Post | null> {
    await connectDb();
    const post = await PostModel.findById(id);
    return post ? toPost(post) : null;
  }

  async updatePost(id: string, data: Partial<NewPost>): Promise<Post | null> {
    await connectDb();
    const updatedPost = await PostModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return updatedPost ? toPost(updatedPost) : null;
  }

  async deletePost(id: string): Promise<boolean> {
    await connectDb();
    const result = await PostModel.findByIdAndDelete(id);
    return !!result;
  }

  async getPostsByLanguage(
    languageCode: string,
    category?: PostCategoryName
  ): Promise<Post[]> {
    await connectDb();
    const query: Record<string, unknown> = {
      "contents.language_code": languageCode,
    };
    if (category) {
      query.category = category;
    }
    const posts = await PostModel.find(query).sort({ created_at: -1 });
    return posts.map(toPost);
  }
}
