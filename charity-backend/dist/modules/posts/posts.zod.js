"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePostSchema = exports.CreatePostSchema = exports.PostContentSchema = exports.PostCategoryEnum = void 0;
const zod_1 = require("zod");
exports.PostCategoryEnum = zod_1.z.enum(["news", "project", "story"]);
exports.PostContentSchema = zod_1.z.object({
    language_code: zod_1.z.string().length(2),
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().min(1).max(300),
    content: zod_1.z.string().min(1),
});
exports.CreatePostSchema = zod_1.z.object({
    category: exports.PostCategoryEnum,
    contents: zod_1.z.array(exports.PostContentSchema).min(1),
    images: zod_1.z.array(zod_1.z.string().min(1)).optional().default([]),
    videos: zod_1.z.array(zod_1.z.string().min(1)).optional().default([]),
    status: zod_1.z.enum(["draft", "published", "archived"]).optional(),
    slug: zod_1.z.string().min(1).optional(),
});
exports.UpdatePostSchema = exports.CreatePostSchema.partial();
//# sourceMappingURL=posts.zod.js.map