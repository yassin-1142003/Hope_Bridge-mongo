"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeEmailSchema = exports.ChangePasswordSchema = exports.UpdateProfileSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
exports.RegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.UpdateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
});
exports.ChangePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(6),
});
exports.ChangeEmailSchema = zod_1.z.object({
    newEmail: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
//# sourceMappingURL=auth.zod.js.map