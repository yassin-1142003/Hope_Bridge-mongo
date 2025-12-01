import { PostsService } from "./posts.service";
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    create(body: any): Promise<{
        message: string;
        details: import("../../db/schemas/post.schema").Post;
    }>;
    findAll(): Promise<{
        message: string;
        details: import("../../db/schemas/post.schema").Post[];
    }>;
    findOne(id: string): Promise<{
        message: string;
        details: import("../../db/schemas/post.schema").Post;
    }>;
    update(id: string, body: any): Promise<{
        message: string;
        details: import("../../db/schemas/post.schema").Post;
    }>;
    freeze(id: string): Promise<{
        message: string;
        details: import("../../db/schemas/post.schema").Post;
    }>;
    remove(id: string): Promise<{
        message: string;
        details: {
            id: string;
        };
    }>;
}
