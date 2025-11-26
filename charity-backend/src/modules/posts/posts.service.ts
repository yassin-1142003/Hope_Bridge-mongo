import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Post, PostDocument, PostStatus } from "../../db/schemas/post.schema";
import { CreatePostDto, UpdatePostDto } from "./posts.zod";

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
  ) {}

  async create(data: CreatePostDto): Promise<Post> {
    const doc = new this.postModel({
      ...data,
      status: data.status ?? PostStatus.PUBLISHED,
    });
    return doc.save();
  }

  async findAll(): Promise<Post[]> {
    return this.postModel
      .find()
      .sort({ createdAt: -1, _id: -1 })
      .lean()
      .exec();
  }

  async findOne(id: string): Promise<Post> {
    const doc = await this.postModel.findById(id).lean().exec();
    if (!doc) {
      throw new NotFoundException("Post not found");
    }
    return doc as any;
  }

  async update(id: string, data: UpdatePostDto): Promise<Post> {
    const doc = await this.postModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec();
    if (!doc) {
      throw new NotFoundException("Post not found");
    }
    return doc as any;
  }

  async freeze(id: string): Promise<Post> {
    const doc = await this.postModel
      .findByIdAndUpdate(id, { status: PostStatus.ARCHIVED }, { new: true })
      .lean()
      .exec();
    if (!doc) {
      throw new NotFoundException("Post not found");
    }
    return doc as any;
  }

  async remove(id: string): Promise<void> {
    const res = await this.postModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException("Post not found");
    }
  }
}
