import { getCollection } from "@/lib/mongodb";
import { MediaService } from "./MediaService";
import slugify from "slugify";
import { ObjectId } from "mongodb";

export interface ProjectContent {
  language_code: string;
  name: string;
  description: string;
  content: string;
  images: string[];
  videos: string[];
  documents: string[];
}

export interface Project {
  _id: string;
  contents: ProjectContent[];
  bannerPhotoUrl: string;
  bannerPhotoId?: string;
  imageGallery: string[];
  videoGallery: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NewProject {
  contents: ProjectContent[];
  bannerPhotoUrl?: string;
  bannerPhotoId?: string;
  imageGallery?: string[];
  videoGallery?: string[];
}

export class ProjectService {
  private mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }

  async create(data: NewProject): Promise<Project> {
    const projectsCollection = await getCollection('projects');
    
    const project = {
      ...data,
      imageGallery: data.imageGallery || [],
      videoGallery: data.videoGallery || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await projectsCollection.insertOne(project);
    
    return {
      _id: result.insertedId.toString(),
      ...project
    };
  }

  async getAll(): Promise<Project[]> {
    const projectsCollection = await getCollection('projects');
    const projects = await projectsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return projects.map(project => ({
      _id: project._id.toString(),
      contents: project.contents,
      bannerPhotoUrl: project.bannerPhotoUrl || '',
      bannerPhotoId: project.bannerPhotoId,
      imageGallery: project.imageGallery || [],
      videoGallery: project.videoGallery || [],
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    }));
  }

  async getById(id: string): Promise<Project | null> {
    const projectsCollection = await getCollection('projects');
    const project = await projectsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!project) return null;
    
    return {
      _id: project._id.toString(),
      contents: project.contents,
      bannerPhotoUrl: project.bannerPhotoUrl || '',
      bannerPhotoId: project.bannerPhotoId,
      imageGallery: project.imageGallery || [],
      videoGallery: project.videoGallery || [],
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };
  }

  async update(id: string, updateData: Partial<NewProject>): Promise<Project | null> {
    const projectsCollection = await getCollection('projects');
    
    const updateDoc = {
      ...updateData,
      updatedAt: new Date()
    };
    
    const result = await projectsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );
    
    if (result.matchedCount === 0) return null;
    
    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const projectsCollection = await getCollection('projects');
    const result = await projectsCollection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async createWithMedia(
    projectData: NewProject,
    bannerFile?: File,
    galleryFiles?: File[]
  ): Promise<Project> {
    // Handle banner photo upload
    if (bannerFile) {
      const bannerMedia = await this.mediaService.uploadFile(bannerFile);
      projectData.bannerPhotoUrl = bannerMedia.url;
      projectData.bannerPhotoId = bannerMedia._id;
    }

    // Handle gallery uploads
    if (galleryFiles && galleryFiles.length > 0) {
      const galleryMedia = await this.mediaService.uploadMultipleFiles(galleryFiles);
      projectData.gallery = galleryMedia.map((media) => media._id);
    }

    return this.create(projectData);
  }

  async updateMedia(
    id: string,
    bannerFile?: File,
    galleryFiles?: File[],
    removeGalleryIds?: string[]
  ): Promise<Project | null> {
    const project = await this.getById(id);
    if (!project) return null;

    const updateData: Partial<NewProject> = {};

    // Handle banner photo update
    if (bannerFile) {
      const bannerMedia = await this.mediaService.uploadFile(bannerFile);
      updateData.bannerPhotoUrl = bannerMedia.url;
      updateData.bannerPhotoId = bannerMedia._id;
    }

    // Handle gallery updates
    let currentGallery = project.gallery || [];
    
    if (galleryFiles && galleryFiles.length > 0) {
      const newGalleryMedia = await this.mediaService.uploadMultipleFiles(galleryFiles);
      currentGallery.push(...newGalleryMedia.map((media) => media._id));
    }

    // Remove specified gallery items
    if (removeGalleryIds && removeGalleryIds.length > 0) {
      currentGallery = currentGallery.filter(
        (galleryId) => !removeGalleryIds.includes(galleryId)
      );
      // Delete the media files
      for (const mediaId of removeGalleryIds) {
        await this.mediaService.deleteMedia(mediaId);
      }
    }

    updateData.gallery = currentGallery;

    return this.update(id, updateData);
  }

  async deleteWithMedia(id: string): Promise<boolean> {
    const project = await this.getById(id);
    if (!project) return false;

    // Delete all associated media
    const allMediaIds = [
      project.bannerPhotoId,
      ...project.gallery
    ].filter((id): id is string => !!id);

    for (const mediaId of allMediaIds) {
      await this.mediaService.deleteMedia(mediaId);
    }

    return this.delete(id);
  }
}
