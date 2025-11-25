/**
 * Utility functions for handling Google Drive URLs
 */

export interface DriveUrlInfo {
  fileId: string | null;
  isVideo: boolean;
  isImage: boolean;
  originalUrl: string;
}

/**
 * Extract file ID from various Google Drive URL formats
 */
export function extractDriveFileId(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  // Format 1: https://drive.google.com/file/d/FILE_ID/view
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1?.[1]) return match1[1];

  // Format 2: https://drive.google.com/open?id=FILE_ID
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2?.[1]) return match2[1];

  // Format 3: https://drive.google.com/uc?id=FILE_ID
  const match3 = url.match(/\/uc\?id=([a-zA-Z0-9_-]+)/);
  if (match3?.[1]) return match3[1];

  // Format 4: Already just an ID
  if (/^[a-zA-Z0-9_-]+$/.test(url)) return url;

  return null;
}

/**
 * Convert Google Drive URL to thumbnail URL for images
 */
export function getDriveImageUrl(url: string, size: "w200" | "w400" | "w800" | "w1200" = "w800"): string {
  const fileId = extractDriveFileId(url);
  if (!fileId) return url;
  
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
}

/**
 * Convert Google Drive URL to preview/embed URL for videos
 */
export function getDriveVideoUrl(url: string): string {
  const fileId = extractDriveFileId(url);
  if (!fileId) return url;
  
  // Use preview endpoint for embeddable video player
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Convert Google Drive URL to direct download URL
 */
export function getDriveDownloadUrl(url: string): string {
  const fileId = extractDriveFileId(url);
  if (!fileId) return url;
  
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Detect if a URL is likely a video based on extension or Drive preview
 */
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
  const lowerUrl = url.toLowerCase();
  
  // Check file extension
  if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
    return true;
  }
  
  // Check if it's a Drive video (videos in Drive often have specific patterns)
  if (url.includes("drive.google.com") && (
    url.includes("/file/d/") || 
    url.includes("id=")
  )) {
    // We'll assume it could be a video if it's from Drive
    // The actual type should be determined by the mimeType in the data
    return false; // Let the mimeType determine this
  }
  
  return false;
}

/**
 * Get optimized media URL based on type
 */
export function getOptimizedMediaUrl(
  url: string,
  type: "image" | "video" | "auto" = "auto"
): string {
  if (!url || !url.includes("drive.google.com")) {
    return url;
  }

  const fileId = extractDriveFileId(url);
  if (!fileId) return url;

  if (type === "video" || (type === "auto" && isVideoUrl(url))) {
    return getDriveVideoUrl(url);
  }

  return getDriveImageUrl(url);
}

