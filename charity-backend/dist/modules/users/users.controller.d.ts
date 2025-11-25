import { UsersService } from "./users.service";
import { Role } from "../../common/enums/role.enum";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
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
    findOne(id: string): Promise<{
        message: string;
        details: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>;
    }>;
    update(id: string, body: Partial<{
        name: string;
        role: Role;
    }>): Promise<{
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
        }>) | null;
    }>;
    remove(id: string): Promise<{
        message: string;
        details: {
            id: string;
        };
    }>;
    block(id: string): Promise<{
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
        }>) | null;
    }>;
    unblock(id: string): Promise<{
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
        }>) | null;
    }>;
}
