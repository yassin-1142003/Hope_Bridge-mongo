/**
 * Cloudinary Service - Browser Compatible
 * 
 * Handles file uploads to Cloudinary using direct API calls
 * without Node.js dependencies for browser compatibility
 */

export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
}

export class CloudinaryService {
  private cloudName: string;
  private uploadPreset: string;

  constructor() {
    this.cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
    this.uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
    
    if (!this.cloudName) {
      console.warn('Cloudinary cloud name not configured');
    }
  }

  /**
   * Upload file to Cloudinary using unsigned upload via browser API
   */
  async uploadFile(file: File, folder: string = 'hope-bridge'): Promise<CloudinaryUploadResult> {
    if (!this.cloudName) {
      throw new Error('Cloudinary cloud name not configured');
    }

    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', folder);

      // Add file type specific options
      if (file.type.startsWith('image/')) {
        formData.append('resource_type', 'image');
      } else if (file.type.startsWith('video/')) {
        formData.append('resource_type', 'video');
      } else {
        formData.append('resource_type', 'raw');
      }

      // Upload to Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`;

      fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Upload failed with status ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.error) {
            reject(new Error(data.error.message));
          } else {
            resolve(data);
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Upload multiple files to Cloudinary
   */
  async uploadMultipleFiles(files: File[], folder: string = 'hope-bridge'): Promise<CloudinaryUploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete file from Cloudinary (requires server-side implementation)
   * Note: This method needs to be implemented server-side due to API key requirements
   */
  async deleteFile(publicId: string, resourceType: string = 'auto'): Promise<boolean> {
    // This would require server-side implementation with API secret
    // For now, return false to indicate it needs server implementation
    console.warn('Delete functionality requires server-side implementation');
    return false;
  }

  /**
   * Get file type from Cloudinary URL
   */
  getFileTypeFromUrl(url: string): 'image' | 'video' | 'document' {
    if (url.includes('/image/upload/') || url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return 'image';
    } else if (url.includes('/video/upload/') || url.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)) {
      return 'video';
    } else {
      return 'document';
    }
  }

  /**
   * Generate optimized URL for Cloudinary resources
   */
  getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
    format?: string;
  } = {}): string {
    if (!this.cloudName) {
      console.warn('Cloudinary cloud name not configured');
      return '';
    }
    
    let transformations = [];
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);

    const transformationString = transformations.length > 0 ? transformations.join(',') : '';
    
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformationString}/${publicId}`;
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 100MB' };
    }

    // Cloudinary accepts virtually all file types
    // We'll only block potentially dangerous executable files
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.app', '.deb', '.rpm', '.dmg', '.pkg', '.msi'];
    const fileName = file.name.toLowerCase();
    const hasDangerousExtension = dangerousExtensions.some(ext => fileName.endsWith(ext));
    
    if (hasDangerousExtension && !file.type.startsWith('image/')) {
      return { valid: false, error: 'Executable files are not allowed for security reasons.' };
    }

    return { valid: true };
  }
}
