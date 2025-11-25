import {
  ProjectModel,
  Project,
  NewProject,
  toProject,
} from "@/backend/database/mongoose/models";
import { connectDb } from "@/backend/database/mongoose/connection";
import { MediaService } from "./MediaService";
import slugify from "slugify";

export class ProjectService {
  private mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }

  async createProject(data: NewProject): Promise<Project> {
    await connectDb();
    if (!data.slug && data.contents?.length) {
      const base = data.contents[0]?.name ?? "project";
      data.slug = slugify(base, { lower: true, strict: true });
    }
    const project = new ProjectModel(data);
    const savedProject = await project.save();
    return toProject(savedProject);
  }

  async createProjectWithMedia(
    projectData: NewProject,
    bannerFile?: File,
    galleryFiles?: File[]
  ): Promise<Project> {
    await connectDb();

    // Handle banner photo upload
    if (bannerFile) {
      const bannerMedia = await this.mediaService.uploadFile(bannerFile);
      projectData.bannerPhotoUrl = bannerMedia.url;
      projectData.bannerPhotoId = bannerMedia.id;
    }

    // Handle gallery uploads
    if (galleryFiles && galleryFiles.length > 0) {
      const galleryMedia =
        await this.mediaService.uploadMultipleFiles(galleryFiles);
      projectData.gallery = galleryMedia.map((media) => media.id);
    }

    return this.createProject(projectData);
  }

  async getAllProjects(): Promise<Project[]> {
    await connectDb();
    const projects = await ProjectModel.find().sort({ created_at: -1 });
    return projects.map(toProject);
  }

  async getProjectById(id: string): Promise<Project | null> {
    await connectDb();
    const project = await ProjectModel.findById(id);
    return project ? toProject(project) : null;
  }

  async getProjectWithMedia(
    id: string
  ): Promise<(Project & { bannerPhoto: string; gallery: string[] }) | null> {
    await connectDb();
    const project = await ProjectModel.findById(id);
    if (!project) return null;

    const projectData = toProject(project);

    // For our imported data, images and videos are already URLs
    // No need to fetch from separate media collection
    return {
      ...projectData,
      bannerPhoto: projectData.bannerPhotoUrl, // Direct URL
      gallery: projectData.gallery || [], // Direct URLs
      contents: projectData.contents.map((content) => ({
        ...content,
        images: content.images || [], // Direct URLs
        videos: content.videos || [], // Direct URLs
        documents: content.documents || [], // Direct URLs
      })),
    };
  }

  async updateProject(
    id: string,
    data: Partial<NewProject>
  ): Promise<Project | null> {
    await connectDb();
    const updatedProject = await ProjectModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return updatedProject ? toProject(updatedProject) : null;
  }

  async updateProjectMedia(
    id: string,
    bannerFile?: File,
    galleryFiles?: File[],
    removeGalleryIds?: string[]
  ): Promise<Project | null> {
    await connectDb();
    const project = await ProjectModel.findById(id);
    if (!project) return null;

    // Handle banner photo update
    if (bannerFile) {
      const bannerMedia = await this.mediaService.uploadFile(bannerFile);
      project.bannerPhotoUrl = bannerMedia.url;
      project.bannerPhotoId = bannerMedia.id;
    }

    // Handle gallery updates
    if (galleryFiles && galleryFiles.length > 0) {
      const newGalleryMedia =
        await this.mediaService.uploadMultipleFiles(galleryFiles);
      project.gallery.push(...newGalleryMedia.map((media) => media.id));
    }

    // Remove specified gallery items
    if (removeGalleryIds && removeGalleryIds.length > 0) {
      project.gallery = project.gallery.filter(
        (id: string) => !removeGalleryIds.includes(id)
      );
      // Optionally delete the media files
      for (const mediaId of removeGalleryIds) {
        await this.mediaService.deleteMedia(mediaId as string);
      }
    }

    await project.save();
    return toProject(project);
  }

  async deleteProject(id: string): Promise<boolean> {
    await connectDb();
    const projectDoc = await ProjectModel.findById(id);

    if (projectDoc) {
      const projectData = toProject(projectDoc);
      const allMediaIds = [
        projectData.bannerPhotoId ?? null,
        ...projectData.gallery,
        ...projectData.contents.flatMap((c) => [
          ...c.images,
          ...c.videos,
          ...c.documents,
        ]),
      ].filter((v): v is string => typeof v === "string" && v.length > 0);

      for (const mediaId of allMediaIds) {
        await this.mediaService.deleteMedia(mediaId);
      }

      await ProjectModel.findByIdAndDelete(id);
      return true;
    }

    return false;
  }

  async getProjectsByLanguage(languageCode: string): Promise<Project[]> {
    await connectDb();
    const projects = await ProjectModel.find({
      "contents.language_code": languageCode,
    }).sort({ created_at: -1 });
    return projects.map(toProject);
  }
}
