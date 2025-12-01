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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostSchema = exports.Post = exports.PostContentSchema = exports.PostContent = exports.PostCategory = exports.PostStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var PostStatus;
(function (PostStatus) {
    PostStatus["DRAFT"] = "draft";
    PostStatus["PUBLISHED"] = "published";
    PostStatus["ARCHIVED"] = "archived";
})(PostStatus || (exports.PostStatus = PostStatus = {}));
var PostCategory;
(function (PostCategory) {
    PostCategory["NEWS"] = "news";
    PostCategory["PROJECT"] = "project";
    PostCategory["STORY"] = "story";
})(PostCategory || (exports.PostCategory = PostCategory = {}));
let PostContent = class PostContent {
};
exports.PostContent = PostContent;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 2 }),
    __metadata("design:type", String)
], PostContent.prototype, "language_code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], PostContent.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 300 }),
    __metadata("design:type", String)
], PostContent.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], PostContent.prototype, "content", void 0);
exports.PostContent = PostContent = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], PostContent);
exports.PostContentSchema = mongoose_1.SchemaFactory.createForClass(PostContent);
let Post = class Post {
};
exports.Post = Post;
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: PostCategory,
        required: true,
    }),
    __metadata("design:type", String)
], Post.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.PostContentSchema], default: [] }),
    __metadata("design:type", Array)
], Post.prototype, "contents", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Post.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Post.prototype, "videos", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: PostStatus,
        default: PostStatus.PUBLISHED,
    }),
    __metadata("design:type", String)
], Post.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Post.prototype, "slug", void 0);
exports.Post = Post = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: "post",
    })
], Post);
exports.PostSchema = mongoose_1.SchemaFactory.createForClass(Post);
exports.PostSchema.index({ category: 1, createdAt: -1 });
exports.PostSchema.index({ slug: 1 }, { sparse: true });
exports.PostSchema.index({ status: 1, createdAt: -1 });
exports.PostSchema.index({ createdAt: -1, _id: -1 });
//# sourceMappingURL=post.schema.js.map