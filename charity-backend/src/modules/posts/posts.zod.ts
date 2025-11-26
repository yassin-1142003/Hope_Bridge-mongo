import { z } from "zod";

export const PostCategoryEnum = z.enum(["news", "project", "story"]);

export const PostContentSchema = z.object({
  language_code: z.string().length(2),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(300),
  content: z.string().min(1),
});

export const CreatePostSchema = z.object({
  category: PostCategoryEnum,
  contents: z.array(PostContentSchema).min(1),
  images: z.array(z.string().min(1)).optional().default([]),
  videos: z.array(z.string().min(1)).optional().default([]),
  status: z.enum(["draft", "published", "archived"]).optional(),
  slug: z.string().min(1).optional(),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export type PostContentDto = z.infer<typeof PostContentSchema>;
export type CreatePostDto = z.infer<typeof CreatePostSchema>;
export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;
