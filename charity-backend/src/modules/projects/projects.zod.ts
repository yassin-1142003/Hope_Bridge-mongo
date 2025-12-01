import { z } from "zod";

export const ProjectContentSchema = z.object({
  language_code: z.string().length(2),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(300),
  content: z.string().min(1),
  images: z.array(z.string().min(1)).optional().default([]),
  videos: z.array(z.string().min(1)).optional().default([]),
  documents: z.array(z.string().min(1)).optional().default([]),
});

export const CreateProjectSchema = z.object({
  bannerPhotoUrl: z.string().url(),
  contents: z.array(ProjectContentSchema).min(1),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export type ProjectContentDto = z.infer<typeof ProjectContentSchema>;
export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;
