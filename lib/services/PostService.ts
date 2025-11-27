import { getCollection } from "@/lib/mongodb";
import slugify from "slugify";
import { ObjectId } from "mongodb";

export interface PostContent {
  language_code: string;
  name: string;
  description: string;
  content: string;
  images: string[];
  videos: string[];
}

export interface Post {
  _id: string;
  contents: PostContent[];
  category: string;
  status: 'draft' | 'published';
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewPost {
  contents: PostContent[];
  category: string;
  status?: 'draft' | 'published';
  slug?: string;
}

export class PostService {
  async create(postData: NewPost): Promise<Post> {
    const postsCollection = await getCollection('posts');
    
    // Generate slug if not provided
    const slug = postData.slug || this.generateSlug(postData.contents);
    
    const post = {
      ...postData,
      slug,
      status: postData.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await postsCollection.insertOne(post);
    
    return {
      _id: result.insertedId.toString(),
      ...post
    };
  }

  async getAll(category?: string): Promise<Post[]> {
    const postsCollection = await getCollection('posts');
    const filter = category ? { category } : {};
    
    const posts = await postsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    return posts.map(post => ({
      _id: post._id.toString(),
      contents: post.contents,
      category: post.category,
      status: post.status,
      slug: post.slug,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));
  }

  async getById(id: string): Promise<Post | null> {
    const postsCollection = await getCollection('posts');
    const post = await postsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!post) return null;
    
    return {
      _id: post._id.toString(),
      contents: post.contents,
      category: post.category,
      status: post.status,
      slug: post.slug,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    };
  }

  async update(id: string, updateData: Partial<NewPost>): Promise<Post | null> {
    const postsCollection = await getCollection('posts');
    
    const updateDoc = {
      ...updateData,
      updatedAt: new Date()
    };
    
    const result = await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );
    
    if (result.matchedCount === 0) return null;
    
    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const postsCollection = await getCollection('posts');
    const result = await postsCollection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  private generateSlug(contents: PostContent[]): string {
    const englishContent = contents.find(c => c.language_code === 'en');
    const name = englishContent?.name || contents[0]?.name || 'untitled';
    return slugify(name, { lower: true, strict: true });
  }
}
