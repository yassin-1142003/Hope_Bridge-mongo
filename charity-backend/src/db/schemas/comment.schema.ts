import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Post } from "./post.schema";
import { User } from "./user.schema";

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true, collection: "comment" })
export class Comment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Post.name, required: true })
  postId!: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Comment.name, default: null })
  parentId?: mongoose.Types.ObjectId | null;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: false })
  authorId?: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  content!: string;

  @Prop({ default: false })
  isFrozen!: boolean;

  @Prop({ default: false })
  isDeleted!: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1, createdAt: -1 });
