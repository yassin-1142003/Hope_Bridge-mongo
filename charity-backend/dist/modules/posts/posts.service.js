"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const post_schema_1 = require("../../db/schemas/post.schema");
let PostsService = class PostsService {
    constructor(postModel) {
        this.postModel = postModel;
    }
    async create(data) {
        var _a;
        const doc = new this.postModel({
            ...data,
            status: (_a = data.status) !== null && _a !== void 0 ? _a : post_schema_1.PostStatus.PUBLISHED,
        });
        return doc.save();
    }
    async findAll() {
        return this.postModel
            .find()
            .sort({ createdAt: -1, _id: -1 })
            .lean()
            .exec();
    }
    async findOne(id) {
        const doc = await this.postModel.findById(id).lean().exec();
        if (!doc) {
            throw new common_1.NotFoundException("Post not found");
        }
        return doc;
    }
    async update(id, data) {
        const doc = await this.postModel
            .findByIdAndUpdate(id, data, { new: true })
            .lean()
            .exec();
        if (!doc) {
            throw new common_1.NotFoundException("Post not found");
        }
        return doc;
    }
    async freeze(id) {
        const doc = await this.postModel
            .findByIdAndUpdate(id, { status: post_schema_1.PostStatus.ARCHIVED }, { new: true })
            .lean()
            .exec();
        if (!doc) {
            throw new common_1.NotFoundException("Post not found");
        }
        return doc;
    }
    async remove(id) {
        const res = await this.postModel.findByIdAndDelete(id).exec();
        if (!res) {
            throw new common_1.NotFoundException("Post not found");
        }
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(post_schema_1.Post.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PostsService);
//# sourceMappingURL=posts.service.js.map