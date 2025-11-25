import { MediaModel, MediaFile, NewMediaFile, toMedia } from "@/backend/database/mongoose/models";
import { connectDb } from "@/backend/database/mongoose/connection";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import * as fs from "fs";

export class MediaService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads");
  }

  async ensureUploadDir() {
    try {
      await mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  async uploadFile(file: File): Promise<MediaFile> {
    await connectDb();
    await this.ensureUploadDir();

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(file.name);
    const filename = `${timestamp}_${randomString}${fileExtension}`;

    // Save file to filesystem
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(this.uploadDir, filename);
    await writeFile(filePath, buffer);

    // Create media record in database
    const mediaData: NewMediaFile = {
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: `/uploads/${filename}`,
    };

    const media = new MediaModel(mediaData);
    const savedMedia = await media.save();
    return toMedia(savedMedia);
  }

  async uploadMultipleFiles(files: File[]): Promise<MediaFile[]> {
    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  async getMediaById(id: string): Promise<MediaFile | null> {
    await connectDb();
    const media = await MediaModel.findById(id);
    return media ? toMedia(media) : null;
  }

  async getAllMedia(): Promise<MediaFile[]> {
    await connectDb();
    const mediaFiles = await MediaModel.find().sort({ uploaded_at: -1 });
    return mediaFiles.map(toMedia);
  }

  async deleteMedia(id: string): Promise<boolean> {
    await connectDb();
    const media = await MediaModel.findByIdAndDelete(id);
    
    if (media) {
      // Optionally delete file from filesystem
      try {
        const filePath = path.join(this.uploadDir, media.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error("Failed to delete file from filesystem:", error);
      }
      return true;
    }
    
    return false;
  }

  async getMediaByType(mimeType: string): Promise<MediaFile[]> {
    await connectDb();
    const mediaFiles = await MediaModel.find({ 
      mimeType: { $regex: new RegExp(mimeType, 'i') }
    }).sort({ uploaded_at: -1 });
    return mediaFiles.map(toMedia);
  }

  // Helper method to validate file types
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => file.type.startsWith(type));
  }

  // Helper method to validate file size
  validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }
}
