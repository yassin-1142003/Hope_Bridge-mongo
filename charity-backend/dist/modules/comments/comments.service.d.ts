import { Model } from "mongoose";
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
export declare class CommentsService {
    private readonly commentModel;
    constructor(commentModel: Model<CommentDocument>);
    create(data: CreateCommentDto): Promise<Comment>;
    findOne(id: string): Promise<Comment>;
    update(id: string, data: UpdateCommentDto): Promise<Comment>;
    freeze(id: string): Promise<Comment>;
    removeSoft(id: string): Promise<Comment>;
    removeHard(id: string): Promise<void>;
    findTreeByPostId(postId: string): Promise<CommentNode[]>;
}
