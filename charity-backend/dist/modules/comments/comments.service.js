"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = __importStar(require("mongoose"));
const comment_schema_1 = require("../../db/schemas/comment.schema");
let CommentsService = class CommentsService {
    constructor(commentModel) {
        this.commentModel = commentModel;
    }
    async create(data) {
        const doc = new this.commentModel({
            postId: new mongoose_2.default.Types.ObjectId(data.postId),
            parentId: data.parentId ? new mongoose_2.default.Types.ObjectId(data.parentId) : null,
            content: data.content,
        });
        return doc.save();
    }
    async findOne(id) {
        const doc = await this.commentModel.findById(id).lean().exec();
        if (!doc) {
            throw new common_1.NotFoundException("Comment not found");
        }
        return doc;
    }
    async update(id, data) {
        const doc = await this.commentModel
            .findByIdAndUpdate(id, { content: data.content }, { new: true })
            .lean()
            .exec();
        if (!doc) {
            throw new common_1.NotFoundException("Comment not found");
        }
        return doc;
    }
    async freeze(id) {
        const doc = await this.commentModel
            .findByIdAndUpdate(id, { isFrozen: true }, { new: true })
            .lean()
            .exec();
        if (!doc) {
            throw new common_1.NotFoundException("Comment not found");
        }
        return doc;
    }
    async removeSoft(id) {
        const doc = await this.commentModel
            .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
            .lean()
            .exec();
        if (!doc) {
            throw new common_1.NotFoundException("Comment not found");
        }
        return doc;
    }
    async removeHard(id) {
        const res = await this.commentModel.findByIdAndDelete(id).exec();
        if (!res) {
            throw new common_1.NotFoundException("Comment not found");
        }
    }
    async findTreeByPostId(postId) {
        const docs = await this.commentModel
            .find({ postId: new mongoose_2.default.Types.ObjectId(postId) })
            .sort({ createdAt: 1 })
            .lean()
            .exec();
        const nodes = {};
        const roots = [];
        for (const doc of docs) {
            const node = {
                id: String(doc._id),
                postId: String(doc.postId),
                parentId: doc.parentId ? String(doc.parentId) : null,
                authorId: doc.authorId ? String(doc.authorId) : null,
                content: doc.content,
                isFrozen: doc.isFrozen,
                isDeleted: doc.isDeleted,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
                replies: [],
            };
            nodes[node.id] = node;
        }
        for (const node of Object.values(nodes)) {
            if (node.parentId && nodes[node.parentId]) {
                nodes[node.parentId].replies.push(node);
            }
            else {
                roots.push(node);
            }
        }
        return roots;
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(comment_schema_1.Comment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CommentsService);
//# sourceMappingURL=comments.service.js.map