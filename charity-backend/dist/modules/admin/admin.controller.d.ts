import { UsersService } from "../users/users.service";
import { ProjectsService } from "../projects/projects.service";
import { PostsService } from "../posts/posts.service";
import { CommentsService, CommentNode } from "../comments/comments.service";
export declare class AdminController {
    private readonly usersService;
    private readonly projectsService;
    private readonly postsService;
    private readonly commentsService;
    constructor(usersService: UsersService, projectsService: ProjectsService, postsService: PostsService, commentsService: CommentsService);
    overview(): Promise<{
        message: string;
        details: {
            userCount: number;
            projectCount: number;
            postCount: number;
        };
    }>;
    allUsers(): Promise<{
        message: string;
        details: (import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>)[];
    }>;
    allProjects(): Promise<{
        message: string;
        details: import("../../db/schemas/enhanced-project.schema").EnhancedProject[];
    }>;
    allPosts(): Promise<{
        message: string;
        details: import("../../db/schemas/post.schema").Post[];
    }>;
    commentsTree(postId: string): Promise<{
        message: string;
        details: CommentNode[];
    }>;
}
