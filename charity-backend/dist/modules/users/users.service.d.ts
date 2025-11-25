import { UsersRepository } from "./users.repository";
import { Role } from "../../common/enums/role.enum";
export declare class UsersService {
    private readonly usersRepo;
    constructor(usersRepo: UsersRepository);
    findByEmail(email: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    findById(id: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    createUser(params: {
        name: string;
        email: string;
        passwordHash: string;
        role?: Role;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    ensureExists(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    updateUser(id: string, update: Partial<{
        name: string;
        role: Role;
    }>): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    removeUser(id: string): Promise<{
        id: string;
    }>;
    setUserActive(id: string, isActive: boolean): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("../../db/schemas/user.schema").User, {}, {}> & import("../../db/schemas/user.schema").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
}
