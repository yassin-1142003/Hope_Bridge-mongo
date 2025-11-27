import { writeFile, mkdir } from "fs/promises";
import path from "path";
import * as fs from "fs";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface MediaFile {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  createdAt: Date;
}

export interface NewMediaFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
}

export class MediaService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  async uploadFile(file: File): Promise<MediaFile> {
    await this.ensureUploadDir();

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}_${randomString}.${extension}`;
    
    const filePath = path.join(this.uploadDir, filename);
    const relativePath = `/uploads/${filename}`;

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save to database
    const mediaCollection = await getCollection('media');
    const mediaFile: NewMediaFile = {
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      path: filePath,
      url: relativePath
    };

    const result = await mediaCollection.insertOne(mediaFile);
    
    return {
      _id: result.insertedId.toString(),
      ...mediaFile,
      createdAt: new Date()
    };
  }

  async uploadMultipleFiles(files: File[]): Promise<MediaFile[]> {
    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  async getMediaById(id: string): Promise<MediaFile | null> {
    const mediaCollection = await getCollection('media');
    const file = await mediaCollection.findOne({ _id: new ObjectId(id) });
    
    if (!file) return null;
    
    return {
      _id: file._id.toString(),
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      path: file.path,
      url: file.url,
      createdAt: file.createdAt
    };
  }

  async getAllMedia(): Promise<MediaFile[]> {
    const mediaCollection = await getCollection('media');
    const files = await mediaCollection.find({}).sort({ createdAt: -1 }).toArray();
    
    return files.map(file => ({
      _id: file._id.toString(),
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      path: file.path,
      url: file.url,
      createdAt: file.createdAt
    }));
  }

  async deleteMedia(id: string): Promise<boolean> {
    const mediaCollection = await getCollection('media');
    const file = await mediaCollection.findOne({ _id: new ObjectId(id) });
    
    if (!file) return false;

    // Delete from disk
    try {
      await fs.promises.unlink(file.path);
    } catch (error) {
      console.error('Failed to delete file from disk:', error);
    }

    // Delete from database
    const result = await mediaCollection.deleteOne({ _id: new ObjectId(id) });
    
    return result.deletedCount > 0;
  }

  async getMediaByType(mimeType: string): Promise<MediaFile[]> {
    const mediaCollection = await getCollection('media');
    const files = await mediaCollection.find({ 
      mimeType: { $regex: new RegExp(mimeType, 'i') }
    }).sort({ createdAt: -1 }).toArray();
    
    return files.map(file => ({
      _id: file._id.toString(),
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      path: file.path,
      url: file.url,
      createdAt: file.createdAt
    }));
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
