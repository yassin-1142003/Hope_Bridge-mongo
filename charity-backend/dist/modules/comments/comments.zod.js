"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCommentSchema = exports.CreateCommentSchema = void 0;
const zod_1 = require("zod");
exports.CreateCommentSchema = zod_1.z.object({
    postId: zod_1.z.string().min(1),
    parentId: zod_1.z.string().min(1).optional(),
    content: zod_1.z.string().min(1).max(2000),
});
exports.UpdateCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(2000),
});
//# sourceMappingURL=comments.zod.js.map