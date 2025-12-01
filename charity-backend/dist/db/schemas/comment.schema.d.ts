import mongoose, { HydratedDocument } from "mongoose";
export type CommentDocument = HydratedDocument<Comment>;
export declare class Comment {
    postId: mongoose.Types.ObjectId;
    parentId?: mongoose.Types.ObjectId | null;
    authorId?: mongoose.Types.ObjectId;
    content: string;
    isFrozen: boolean;
    isDeleted: boolean;
}
export declare const CommentSchema: mongoose.Schema<Comment, mongoose.Model<Comment, any, any, any, mongoose.Document<unknown, any, Comment, any, {}> & Comment & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Comment, mongoose.Document<unknown, {}, mongoose.FlatRecord<Comment>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<Comment> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
