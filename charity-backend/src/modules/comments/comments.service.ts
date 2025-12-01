import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { Comment, CommentDocument } from "../../db/schemas/comment.schema";
import { CreateCommentDto, UpdateCommentDto } from "./comments.zod";

export interface CommentNode {
  id: string;
  postId: string;
  parentId: string | null;
  authorId: string | null;
  content: string;
  isFrozen: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies: CommentNode[];
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
  ) {}

  async create(data: CreateCommentDto): Promise<Comment> {
    const doc = new this.commentModel({
      postId: new mongoose.Types.ObjectId(data.postId),
      parentId: data.parentId ? new mongoose.Types.ObjectId(data.parentId) : null,
      content: data.content,
    });
    return doc.save();
  }

  async findOne(id: string): Promise<Comment> {
    const doc = await this.commentModel.findById(id).lean().exec();
    if (!doc) {
      throw new NotFoundException("Comment not found");
    }
    return doc as any;
  }

  async update(id: string, data: UpdateCommentDto): Promise<Comment> {
    const doc = await this.commentModel
      .findByIdAndUpdate(id, { content: data.content }, { new: true })
      .lean()
      .exec();
    if (!doc) {
      throw new NotFoundException("Comment not found");
    }
    return doc as any;
  }

  async freeze(id: string): Promise<Comment> {
    const doc = await this.commentModel
      .findByIdAndUpdate(id, { isFrozen: true }, { new: true })
      .lean()
      .exec();
    if (!doc) {
      throw new NotFoundException("Comment not found");
    }
    return doc as any;
  }

  async removeSoft(id: string): Promise<Comment> {
    const doc = await this.commentModel
      .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .lean()
      .exec();
    if (!doc) {
      throw new NotFoundException("Comment not found");
    }
    return doc as any;
  }

  async removeHard(id: string): Promise<void> {
    const res = await this.commentModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException("Comment not found");
    }
  }

  async findTreeByPostId(postId: string): Promise<CommentNode[]> {
    const docs = await this.commentModel
      .find({ postId: new mongoose.Types.ObjectId(postId) })
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    const nodes: Record<string, CommentNode> = {};
    const roots: CommentNode[] = [];

    for (const doc of docs as any[]) {
      const node: CommentNode = {
        id: String(doc._id),
        postId: String(doc.postId),
        parentId: doc.parentId ? String(doc.parentId) : null,
        authorId: doc.authorId ? String(doc.authorId) : null,
        content: doc.content,
        isFrozen: doc.isFrozen,
        isDeleted: doc.isDeleted,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        replies: [],
      };
      nodes[node.id] = node;
    }

    for (const node of Object.values(nodes)) {
      if (node.parentId && nodes[node.parentId]) {
        nodes[node.parentId].replies.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}
