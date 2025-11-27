"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Play, Calendar, ArrowRight } from "lucide-react";
import MediaGallery from "./MediaGallery";

type ProjectContent = {
  language_code: string;
  name: string;
  description: string;
  content: string;
  images: string[];
  videos: string[];
  documents: string[];
};

type MediaFile = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploaded_at: string;
};

type Project = {
  id: string;
  bannerPhotoUrl: string;
  bannerPhotoId?: string;
  gallery: string[];
  created_at: string;
  contents: ProjectContent[];
  bannerPhoto?: MediaFile;
  galleryFiles?: MediaFile[];
};

type ProjectCardProps = {
  project: Project;
  locale: string;
  showFullGallery?: boolean;
};

export default function ProjectCard({ project, locale, showFullGallery = true }: ProjectCardProps) {
  const [projectWithMedia, setProjectWithMedia] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isArabic = locale === "ar";
  
  // Get localized content
  const localized = project.contents?.find(
    (c) => c.language_code === locale
  ) || project.contents?.find((c) => c.language_code === "en");

  useEffect(() => {
    const fetchProjectMedia = async () => {
      if (!project.id || (project.bannerPhotoId && project.gallery.length === 0)) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3002')}/api/projects/${project.id}`);
        if (response.ok) {
          const data = await response.json();
          setProjectWithMedia(data.data);
        }
      } catch (error) {
        console.error("Error fetching project media:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectMedia();
  }, [project.id, project.bannerPhotoId, project.gallery.length]);

  // Convert Google Drive URLs to proper display URLs
  const getDisplayUrl = (url: string) => {
    if (!url || !url.includes('drive.google.com')) return url;
    
    // Extract file ID from Google Drive URL (handle both formats)
    let fileId = null;
    
    // Handle /d/FILE_ID format
    const match1 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match1 && match1[1]) {
      fileId = match1[1];
    }
    
    // Handle id=FILE_ID format (your current format)
    if (!fileId) {
      const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (match2 && match2[1]) {
        fileId = match2[1];
      }
    }
    
    if (fileId) {
      // For images, use thumbnail URL for faster loading
      if (url.includes('export=download')) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
      }
      // For existing view URLs, convert to thumbnail
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
    }
    return url;
  };

  // Generate proper slug for project URLs
  const generateProjectSlug = (projectId: string, projectName: string) => {
    const slugify = (text: string) => {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    };
    
    const titleSlug = slugify(projectName);
    return `${titleSlug}-${projectId}`;
  };

  const currentProject = projectWithMedia || project;
  const bannerUrl = getDisplayUrl(currentProject.bannerPhoto?.url || currentProject.bannerPhotoUrl);
  const galleryFiles = currentProject.galleryFiles || [];

  const galleryFileUrls = galleryFiles
    .map((file) => file.url)
    .filter((url): url is string => typeof url === "string" && url.length > 0);

  const legacyGalleryUrls =
    (currentProject.gallery || []).filter(
      (entry): entry is string => typeof entry === "string" && entry.length > 0
    ) || [];

  const localizedImages = (localized?.images || []).filter(
    (url): url is string => typeof url === "string" && url.length > 0
  );

  const localizedVideos = (localized?.videos || []).filter(
    (url): url is string => typeof url === "string" && url.length > 0
  );

  const imageUrls = Array.from(new Set([...galleryFileUrls, ...legacyGalleryUrls, ...localizedImages]));
  const videoUrls = Array.from(new Set(localizedVideos));
  const hasMedia = imageUrls.length > 0 || videoUrls.length > 0;

  const galleryFileUrlSet = new Set(galleryFileUrls);

  // Combine all media for gallery previews
  const allMedia = [
    ...galleryFiles,
    ...imageUrls
      .filter((url) => !galleryFileUrlSet.has(url))
      .map((url) => ({
        id: url,
        filename: "",
        originalName: "",
        mimeType: "image/jpeg",
        size: 0,
        url: url.startsWith("http") ? getDisplayUrl(url) : `/api/media/${url}`,
        uploaded_at: "",
      })),
    ...videoUrls.map((url) => ({
      id: url,
      filename: "",
      originalName: "",
      mimeType: "video/mp4",
      size: 0,
      url: url.startsWith("http") ? url : `/api/media/${url}`,
      uploaded_at: "",
    })),
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!localized) return null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${isArabic ? "rtl" : "ltr"}`}>
      {/* Banner Image */}
      <div className="relative h-64 md:h-72 overflow-hidden group">
        {bannerUrl ? (
          <>
            <Image
              src={bannerUrl}
              alt={localized.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized={true} // Important for Google Drive images
              referrerPolicy="no-referrer"
              priority={false} // Don't prioritize banner images
              placeholder="blur" // Add blur placeholder
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"
              onError={(e) => {
                console.warn("Failed to load banner image:", bannerUrl);
                const img = e.target as HTMLImageElement;
                if (img.src.includes('thumbnail')) {
                  // Fallback to even smaller thumbnail
                  const fileId = img.src.match(/id=([^&]+)/)?.[1];
                  if (fileId) {
                    img.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w100`;
                  }
                }
              }}
            />
            {/* Overlay for video indicator */}
            {allMedia.some(m => m.mimeType.startsWith('video/')) && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-16 h-16 text-white" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400 text-lg">No Image</span>
          </div>
        )}
        
        {/* Date badge */}
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
          <Calendar className="inline w-4 h-4 mr-1" />
          {formatDate(currentProject.created_at)}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {localized.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
            {localized.description}
          </p>
        </div>

        {/* Media Gallery Preview */}
        {allMedia.length > 0 && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allMedia.slice(0, 4).map((media, index) => (
                <div
                  key={`${media.id}-${index}`}
                  className="relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
                >
                  {media.mimeType.startsWith('video/') ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                      <Play className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                  ) : (
                    <Image
                      src={media.url}
                      alt={`Media ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
              ))}
              {allMedia.length > 4 && (
                <div className="flex-shrink-0 w-20 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">+{allMedia.length - 4}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link
          href={`/${locale}/projects/${generateProjectSlug(currentProject.id || '', localized.name || '')}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          {isArabic ? "عرض التفاصيل" : "View Details"}
          <ArrowRight className={`w-4 h-4 ${isArabic ? "rotate-180" : ""}`} />
        </Link>
      </div>

      {/* Full Gallery Modal */}
      {showFullGallery && hasMedia && (
        <div className="mt-4">
          <MediaGallery imageUrls={imageUrls} videoUrls={videoUrls} className="w-full" />
        </div>
      )}
    </div>
  );
}
