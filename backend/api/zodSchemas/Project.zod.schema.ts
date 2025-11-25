import { z } from "zod";

export const PostProjectSchema = z.object({
  id: z.string().optional(),
  created_at: z.string().optional(),
  images: z.array(z.string().url("Image must be a valid URL")).optional(),
  videos: z.array(z.string().url("Video must be a valid URL")).optional(),
  category: z.enum(["project", "news", "story"]),
  contents: z
    .array(
      z.object({
        id: z.string().optional(),
        post_id: z.string().optional(),
        language_code: z.string().max(2),
        name: z.string().min(1, "Name is required").max(100),
        description: z.string().min(1, "Description is required").max(300),
        content: z.string().min(1, "Content is required"),
      }),
    )
    .min(1, "At least one language content is required")
    .refine(
      (contents) =>
        contents.some(
          (c) => c.name?.trim() && c.description?.trim() && c.content?.trim(),
        ),
      {
        message: "At least one language must have complete content",
        path: ["contents"],
      },
    ),
});
