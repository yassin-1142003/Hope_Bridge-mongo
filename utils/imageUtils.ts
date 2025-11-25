// utils/imageUtils.ts

/**
 * Converts Google Drive sharing URLs to direct image URLs
 * @param url - The original URL (could be Google Drive sharing link or regular URL)
 * @returns Direct image URL that can be used in img tags
 */
export const getDirectImageUrl = (url: string): string => {
  // Handle Google Drive sharing links
  if (url.includes('drive.google.com/file/d/')) {
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  
  // Handle other cloud storage services if needed
  // Add more conversions here as needed
  
  return url; // Return original URL if no conversion needed
};

/**
 * Gets a fallback image URL for when images fail to load
 * @param width - Image width
 * @param height - Image height
 * @param text - Optional text to display on placeholder
 * @returns Placeholder image URL
 */
export const getFallbackImageUrl = (
  width: number = 400, 
  height: number = 200, 
  text: string = "No Image"
): string => {
  return `https://placehold.net/${width}x${height}/cccccc/666666?text=${encodeURIComponent(text)}`;
};

/**
 * Validates if an image URL is likely to work
 * @param url - Image URL to validate
 * @returns Boolean indicating if URL is likely valid
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // Check for common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  const hasImageExtension = imageExtensions.test(url);
  
  // Check for known image hosting patterns
  const imageHostingPatterns = [
    /drive\.google\.com/,
    /picsum\.photos/,
    /placehold/,
    /imgur\.com/,
    /cloudinary\.com/,
  ];
  
  const hasKnownPattern = imageHostingPatterns.some(pattern => pattern.test(url));
  
  return hasImageExtension || hasKnownPattern || url.startsWith('data:image/');
};