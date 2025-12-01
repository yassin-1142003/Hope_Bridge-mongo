import { HydratedDocument } from "mongoose";
export type ProjectDocument = HydratedDocument<Project>;
export declare class ProjectContent {
    language_code: string;
    name: string;
    description: string;
    content: string;
    images: string[];
    videos: string[];
    documents: string[];
}
export declare const ProjectContentSchema: import("mongoose").Schema<ProjectContent, import("mongoose").Model<ProjectContent, any, any, any, import("mongoose").Document<unknown, any, ProjectContent, any, {}> & ProjectContent & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProjectContent, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ProjectContent>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ProjectContent> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class Project {
    bannerPhotoUrl: string;
    imageGallery: string[];
    videoGallery: string[];
    contents: ProjectContent[];
}
export declare const ProjectSchema: import("mongoose").Schema<Project, import("mongoose").Model<Project, any, any, any, import("mongoose").Document<unknown, any, Project, any, {}> & Project & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Project, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Project>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Project> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
