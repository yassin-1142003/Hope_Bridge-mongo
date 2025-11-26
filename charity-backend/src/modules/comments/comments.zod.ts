import { z } from "zod";

export const CreateCommentSchema = z.object({
  postId: z.string().min(1),
  parentId: z.string().min(1).optional(),
  content: z.string().min(1).max(2000),
});

export const UpdateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentDto = z.infer<typeof UpdateCommentSchema>;
