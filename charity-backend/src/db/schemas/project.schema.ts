import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "./user.schema";

export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ required: true, trim: true })
  category!: string;

  @Prop({ required: true, min: 0 })
  goalAmount!: number;

  @Prop({ default: 0, min: 0 })
  currentAmount!: number;

  @Prop({ type: String, enum: ProjectStatus, default: ProjectStatus.ACTIVE })
  status!: ProjectStatus;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: false })
  createdBy?: mongoose.Types.ObjectId;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
