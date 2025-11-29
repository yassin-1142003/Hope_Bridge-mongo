import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ _id: false })
export class ProjectContent {
  @Prop({ required: true, trim: true, maxlength: 2 })
  language_code!: string;

  @Prop({ required: true, trim: true, maxlength: 100 })
  name!: string;

  @Prop({ required: true, trim: true, maxlength: 300 })
  description!: string;

  @Prop({ required: true, trim: true })
  content!: string;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ type: [String], default: [] })
  videos!: string[];

  @Prop({ type: [String], default: [] })
  documents!: string[];
}

export const ProjectContentSchema = SchemaFactory.createForClass(ProjectContent);

@Schema({
  timestamps: true,
  collection: "project",
})
export class Project {
  @Prop({ required: true, trim: true })
  bannerPhotoUrl!: string;

  @Prop({ type: [String], default: [] })
  imageGallery!: string[];

  @Prop({ type: [String], default: [] })
  videoGallery!: string[];

  @Prop({ type: [ProjectContentSchema], default: [] })
  contents!: ProjectContent[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
