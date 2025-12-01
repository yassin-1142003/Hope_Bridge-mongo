import { Model } from "mongoose";
import { Post, PostDocument } from "../../db/schemas/post.schema";
import { CreatePostDto, UpdatePostDto } from "./posts.zod";
export declare class PostsService {
    private readonly postModel;
    constructor(postModel: Model<PostDocument>);
    create(data: CreatePostDto): Promise<Post>;
    findAll(): Promise<Post[]>;
    findOne(id: string): Promise<Post>;
    update(id: string, data: UpdatePostDto): Promise<Post>;
    freeze(id: string): Promise<Post>;
    remove(id: string): Promise<void>;
}
