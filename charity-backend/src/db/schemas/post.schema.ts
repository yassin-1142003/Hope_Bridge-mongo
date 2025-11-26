import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export enum PostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export enum PostCategory {
  NEWS = "news",
  PROJECT = "project",
  STORY = "story",
}

export type PostDocument = HydratedDocument<Post>;

@Schema({ _id: false })
export class PostContent {
  @Prop({ required: true, trim: true, maxlength: 2 })
  language_code!: string;

  @Prop({ required: true, trim: true, maxlength: 100 })
  name!: string;

  @Prop({ required: true, trim: true, maxlength: 300 })
  description!: string;

  @Prop({ required: true, trim: true })
  content!: string;
}

export const PostContentSchema = SchemaFactory.createForClass(PostContent);

@Schema({
  timestamps: true,
  collection: "post",
})
export class Post {
  @Prop({
    type: String,
    enum: PostCategory,
    required: true,
  })
  category!: PostCategory;

  @Prop({ type: [PostContentSchema], default: [] })
  contents!: PostContent[];

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ type: [String], default: [] })
  videos!: string[];

  @Prop({
    type: String,
    enum: PostStatus,
    default: PostStatus.PUBLISHED,
  })
  status!: PostStatus;

  @Prop({ type: String, default: null })
  slug?: string | null;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ category: 1, createdAt: -1 });
PostSchema.index({ slug: 1 }, { sparse: true });
PostSchema.index({ status: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1, _id: -1 });
