import { z } from "zod";
export declare const CreateCommentSchema: z.ZodObject<{
    postId: z.ZodString;
    parentId: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
    postId: string;
    parentId?: string | undefined;
}, {
    content: string;
    postId: string;
    parentId?: string | undefined;
}>;
export declare const UpdateCommentSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentDto = z.infer<typeof UpdateCommentSchema>;
