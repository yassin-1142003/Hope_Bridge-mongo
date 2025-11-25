"use client";
import React, { useState, useEffect } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  ImageIcon,
  FolderOpenIcon,
  FileTextIcon,
  TypeIcon,
  AlignLeftIcon,
} from "lucide-react";
import Image from "next/image";

// --- Schema ---
export const PostProject = z.object({
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
      })
    )
    .min(1, "At least one language content is required")
    .refine(
      (contents) =>
        contents.some(
          (c) => c.name?.trim() && c.description?.trim() && c.content?.trim()
        ),
      {
        message: "At least one language must have complete content",
        path: ["contents"],
      }
    ),
});

type PostProjectType = z.infer<typeof PostProject>;
type Lang = { code: string };

interface Props {
  langs: Lang[];
  project?: PostProjectType;
  isEdit?: boolean;
}

export default function ProjectContentForm({
  langs,
  project,
  isEdit = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const methods = useForm<PostProjectType>({
    resolver: zodResolver(PostProject),
    defaultValues: {
      id: project?.id || undefined,
      created_at: project?.created_at || undefined,
      images: project?.images || [],
      videos: project?.videos || [],
      category: project?.category || "project",
      contents:
        project?.contents ||
        langs.map((lang) => ({
          language_code: lang.code,
          name: "",
          description: "",
          content: "",
          id: undefined,
          post_id: undefined,
        })),
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = methods;

  // Watch for form changes to enable better UX
  const watchedValues = watch();

  // Reset form when project changes (edit mode) - FIXED VERSION
  useEffect(() => {
    if (project) {
      // Prepare contents with proper mapping to existing languages
      const projectContents = langs.map((lang) => {
        const existingContent = project.contents?.find(
          (content) => content.language_code === lang.code
        );

        return (
          existingContent || {
            language_code: lang.code,
            name: "",
            description: "",
            content: "",
            id: undefined,
            post_id: undefined,
          }
        );
      });

      // Reset with complete data structure
      reset({
        id: project.id,
        created_at: project.created_at,
        images: project.images || [], // Ensure images are preserved
        videos: project.videos || [], // Ensure videos are preserved
        category: project.category,
        contents: projectContents,
      });
    }
  }, [project, reset, langs]);

  // Helper function to add image
  const addImage = () => {
    const currentImages = getValues("images") || [];
    setValue("images", [...currentImages, ""]);
  };

  // Helper function to remove image
  const removeImage = (index: number) => {
    const currentImages = getValues("images") || [];
    const updatedImages = currentImages.filter((_, idx) => idx !== index);
    setValue("images", updatedImages);
  };

  // Helper function to add video
  const addVideo = () => {
    const currentVideos = getValues("videos") || [];
    setValue("videos", [...currentVideos, ""]);
  };

  // Helper function to remove video
  const removeVideo = (index: number) => {
    const currentVideos = getValues("videos") || [];
    const updatedVideos = currentVideos.filter((_, idx) => idx !== index);
    setValue("videos", updatedVideos);
  };

  const onSubmit: SubmitHandler<PostProjectType> = async (data) => {
    try {
      setLoading(true);

      // Clean up data - remove empty contents
      const cleanedContents = data.contents.filter(
        (content) =>
          content.name?.trim() ||
          content.description?.trim() ||
          content.content?.trim()
      );

      // Clean up images and videos - remove empty strings
      const cleanedImages = (data.images || []).filter(
        (img) => img.trim() !== ""
      );
      const cleanedVideos = (data.videos || []).filter(
        (vid) => vid.trim() !== ""
      );

      // Prepare the data with proper structure
      const cleanedData = {
        ...data,
        images: cleanedImages,
        videos: cleanedVideos,
        contents: cleanedContents,
      };

      // For edit mode, ensure we preserve existing IDs
      if (isEdit && project) {
        cleanedData.id = project.id;
        cleanedData.created_at = project.created_at;

        // Map existing content IDs if they exist
        cleanedData.contents = cleanedContents.map((content) => {
          const existingContent = project.contents?.find(
            (pc) => pc.language_code === content.language_code
          );

          return {
            ...content,
            id: existingContent?.id || content.id,
            post_id: existingContent?.post_id || project.id,
          };
        });
      }

      // Determine the correct endpoint and method
      const endpoint = isEdit && project?.id ? `/api/post` : `/api/post`;
      const method = isEdit ? "PATCH" : "POST";

      console.log("Submitting to:", endpoint, "Method:", method);
      console.log("Data:", cleanedData);

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || `Server error: ${res.status}`);
      }

      const result = await res.json();
      console.log("Result:", result);

      toast.success(
        isEdit
          ? "✅ Project updated successfully!"
          : "✅ Project created successfully!"
      );

      if (isEdit) {
        router.refresh();
      } else {
        reset();
      }
    } catch (error) {
      console.error("❌ Error submitting project:", error);
      toast.error(
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Failed to save project. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center p-4 sm:p-8">
      <Card className="w-full rounded-xl md:w-[700px] shadow-lg border border-border">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">
            {isEdit ? "✏️ Edit Project" : "🚀 Create New Project"}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {isEdit
              ? "Update the details of your project"
              : "Fill in the details to share with the community"}
          </p>
        </CardHeader>

        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Hidden fields for edit mode */}
              {isEdit && project?.id && (
                <>
                  <input type="hidden" {...register("id")} />
                  <input type="hidden" {...register("created_at")} />
                </>
              )}

              {/* Images */}
              <div>
                <Label className="font-medium flex gap-2 items-center">
                  <ImageIcon className="w-4 h-4 text-primary" /> Images
                </Label>
                {(watchedValues.images || []).map((img, idx) => (
                  <div key={idx} className="flex items-center gap-2 mt-2">
                    <Input
                      {...register(`images.${idx}` as const)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(idx)}
                    >
                      ✖
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={addImage}
                >
                  ➕ Add Image
                </Button>
                {errors.images && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.images.message}
                  </p>
                )}
              </div>

              {/* Videos */}
              <div className="mt-6">
                <Label className="font-medium flex gap-2 items-center">
                  🎥 Videos
                </Label>
                {(watchedValues.videos || []).map((vid, idx) => (
                  <div key={idx} className="flex items-center gap-2 mt-2">
                    <Input
                      {...register(`videos.${idx}` as const)}
                      placeholder="https://youtube.com/embed/..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeVideo(idx)}
                    >
                      ✖
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={addVideo}
                >
                  ➕ Add Video
                </Button>
                {errors.videos && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.videos.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <Label
                  htmlFor="category"
                  className="font-medium flex gap-2 items-center"
                >
                  <FolderOpenIcon className="w-4 h-4 text-primary" /> Category
                </Label>
                <select
                  id="category"
                  {...register("category")}
                  className="mt-2 w-full border text-lg rounded-md p-2 focus:ring-2 focus:ring-primary/60 bg-background"
                >
                  <option value="project">📌 Project</option>
                  <option value="news">📰 News</option>
                  <option value="story">📖 Story</option>
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Tabs for Multi-Lang */}
              <div>
                <Label className="font-medium flex gap-2 items-center mb-3">
                  🌐 Project Content (Multiple Languages)
                </Label>
                <Tabs defaultValue={langs[0]?.code} className="w-full">
                  <TabsList className="mb-4 flex flex-wrap justify-center gap-2">
                    {langs.map((lang) => (
                      <TabsTrigger
                        key={lang.code}
                        value={lang.code}
                        className="px-4 py-2 text-sm rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                      >
                        🌐 {lang.code.toUpperCase()}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {langs.map((lang, idx) => (
                    <TabsContent key={lang.code} value={lang.code}>
                      <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                        {/* Hidden fields for existing content IDs */}
                        {isEdit && (
                          <>
                            <input
                              type="hidden"
                              {...register(`contents.${idx}.id`)}
                            />
                            <input
                              type="hidden"
                              {...register(`contents.${idx}.post_id`)}
                            />
                            <input
                              type="hidden"
                              {...register(`contents.${idx}.language_code`)}
                              value={lang.code}
                            />
                          </>
                        )}

                        {/* Name */}
                        <div>
                          <Label
                            htmlFor={`contents.${idx}.name`}
                            className="flex items-center gap-2 font-medium"
                          >
                            <TypeIcon className="w-4 h-4 text-primary" />
                            Project Name ({lang.code.toUpperCase()})
                          </Label>
                          <Input
                            id={`contents.${idx}.name`}
                            {...register(`contents.${idx}.name`)}
                            placeholder="Enter project name"
                            className="mt-2"
                          />
                          {errors.contents?.[idx]?.name && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.contents[idx]?.name?.message}
                            </p>
                          )}
                        </div>

                        {/* Description */}
                        <div>
                          <Label
                            htmlFor={`contents.${idx}.description`}
                            className="flex items-center gap-2 font-medium"
                          >
                            <AlignLeftIcon className="w-4 h-4 text-primary" />
                            Short Description ({lang.code.toUpperCase()})
                          </Label>
                          <Input
                            id={`contents.${idx}.description`}
                            {...register(`contents.${idx}.description`)}
                            placeholder="Brief description of the project"
                            className="mt-2"
                          />
                          {errors.contents?.[idx]?.description && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.contents[idx]?.description?.message}
                            </p>
                          )}
                        </div>

                        {/* Content */}
                        <div>
                          <Label
                            htmlFor={`contents.${idx}.content`}
                            className="flex items-center gap-2 font-medium"
                          >
                            <FileTextIcon className="w-4 h-4 text-primary" />
                            Detailed Content ({lang.code.toUpperCase()})
                          </Label>
                          <Textarea
                            id={`contents.${idx}.content`}
                            {...register(`contents.${idx}.content`)}
                            placeholder="Write detailed project information, goals, impact, etc..."
                            className="mt-2"
                            rows={6}
                          />
                          {errors.contents?.[idx]?.content && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.contents[idx]?.content?.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              {/* Global error */}
              {errors.contents &&
                typeof errors.contents.message === "string" && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600 text-center text-sm">
                      {errors.contents.message}
                    </p>
                  </div>
                )}

              {/* Submit */}
              <div className="flex justify-center pt-4">
                <Button
                  disabled={loading}
                  type="submit"
                  className="px-8 py-3 rounded-lg shadow-md text-base sm:text-lg transition-all hover:scale-[1.02] min-w-[160px]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isEdit ? "Updating..." : "Creating..."}
                    </span>
                  ) : isEdit ? (
                    "📝 Update Project"
                  ) : (
                    "🚀 Create Project"
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
