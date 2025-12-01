import { z } from "zod";
export declare const PostCategoryEnum: z.ZodEnum<["news", "project", "story"]>;
export declare const PostContentSchema: z.ZodObject<{
    language_code: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    language_code: string;
    description: string;
    content: string;
    name: string;
}, {
    language_code: string;
    description: string;
    content: string;
    name: string;
}>;
export declare const CreatePostSchema: z.ZodObject<{
    category: z.ZodEnum<["news", "project", "story"]>;
    contents: z.ZodArray<z.ZodObject<{
        language_code: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        language_code: string;
        description: string;
        content: string;
        name: string;
    }, {
        language_code: string;
        description: string;
        content: string;
        name: string;
    }>, "many">;
    images: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    videos: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    status: z.ZodOptional<z.ZodEnum<["draft", "published", "archived"]>>;
    slug: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    contents: {
        language_code: string;
        description: string;
        content: string;
        name: string;
    }[];
    category: "project" | "news" | "story";
    images: string[];
    videos: string[];
    status?: "draft" | "published" | "archived" | undefined;
    slug?: string | undefined;
}, {
    contents: {
        language_code: string;
        description: string;
        content: string;
        name: string;
    }[];
    category: "project" | "news" | "story";
    status?: "draft" | "published" | "archived" | undefined;
    slug?: string | undefined;
    images?: string[] | undefined;
    videos?: string[] | undefined;
}>;
export declare const UpdatePostSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodEnum<["news", "project", "story"]>>;
    contents: z.ZodOptional<z.ZodArray<z.ZodObject<{
        language_code: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        language_code: string;
        description: string;
        content: string;
        name: string;
    }, {
        language_code: string;
        description: string;
        content: string;
        name: string;
    }>, "many">>;
    images: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    videos: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodEnum<["draft", "published", "archived"]>>>;
    slug: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    contents?: {
        language_code: string;
        description: string;
        content: string;
        name: string;
    }[] | undefined;
    status?: "draft" | "published" | "archived" | undefined;
    category?: "project" | "news" | "story" | undefined;
    slug?: string | undefined;
    images?: string[] | undefined;
    videos?: string[] | undefined;
}, {
    contents?: {
        language_code: string;
        description: string;
        content: string;
        name: string;
    }[] | undefined;
    status?: "draft" | "published" | "archived" | undefined;
    category?: "project" | "news" | "story" | undefined;
    slug?: string | undefined;
    images?: string[] | undefined;
    videos?: string[] | undefined;
}>;
export type PostContentDto = z.infer<typeof PostContentSchema>;
export type CreatePostDto = z.infer<typeof CreatePostSchema>;
export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;
