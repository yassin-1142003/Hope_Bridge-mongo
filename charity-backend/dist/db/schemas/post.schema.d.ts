import { HydratedDocument } from "mongoose";
export declare enum PostStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}
export declare enum PostCategory {
    NEWS = "news",
    PROJECT = "project",
    STORY = "story"
}
export type PostDocument = HydratedDocument<Post>;
export declare class PostContent {
    language_code: string;
    name: string;
    description: string;
    content: string;
}
export declare const PostContentSchema: import("mongoose").Schema<PostContent, import("mongoose").Model<PostContent, any, any, any, import("mongoose").Document<unknown, any, PostContent, any, {}> & PostContent & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PostContent, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<PostContent>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PostContent> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class Post {
    category: PostCategory;
    contents: PostContent[];
    images: string[];
    videos: string[];
    status: PostStatus;
    slug?: string | null;
}
export declare const PostSchema: import("mongoose").Schema<Post, import("mongoose").Model<Post, any, any, any, import("mongoose").Document<unknown, any, Post, any, {}> & Post & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Post, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Post>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Post> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
