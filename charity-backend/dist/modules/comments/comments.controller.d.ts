import { CommentsService, CommentNode } from "./comments.service";
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    create(body: any): Promise<{
        message: string;
        details: import("../../db/schemas/comment.schema").Comment;
    }>;
    findOne(id: string): Promise<{
        message: string;
        details: import("../../db/schemas/comment.schema").Comment;
    }>;
    update(id: string, body: any): Promise<{
        message: string;
        details: import("../../db/schemas/comment.schema").Comment;
    }>;
    freeze(id: string): Promise<{
        message: string;
        details: import("../../db/schemas/comment.schema").Comment;
    }>;
    softDelete(id: string): Promise<{
        message: string;
        details: import("../../db/schemas/comment.schema").Comment;
    }>;
    hardDelete(id: string): Promise<{
        message: string;
        details: {
            id: string;
        };
    }>;
    getTree(postId: string): Promise<{
        message: string;
        details: CommentNode[];
    }>;
}
