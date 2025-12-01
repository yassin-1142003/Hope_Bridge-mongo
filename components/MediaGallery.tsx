"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Fullscreen,
  Film,
} from "lucide-react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { getDriveImageUrl, getDriveVideoUrl } from "@/lib/driveUtils";

type MediaFile = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploaded_at: string;
};

type MediaGalleryProps = {
  mediaFiles?: MediaFile[];
  imageUrls?: string[];
  videoUrls?: string[];
  className?: string;
};

type GalleryItem = {
  type: "img" | "video";
  displayUrl: string;
  thumbnailUrl: string;
  originalUrl: string;
  originalName?: string;
};

function CreativeVideoLoader() {
  const locale = useLocale();
  const isArabic = locale === "ar";
  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center bg-linear-to-br from-[#1a1a1a] to-[#2a2a2a] z-20 overflow-hidden">
      {/* Main loader container */}
      <div className="relative z-10 flex flex-col justify-center items-center gap-8">
        {/* Film reel animation */}
        <div className="relative">
          {/* Rotating outer ring */}
          <div className="w-24 h-24 border-4 border-amber-500/30 rounded-full animate-spin-slow" />

          {/* Counter-rotating inner ring */}
          <div className="absolute inset-2 border-4 border-t-primary/70 border-r-primary border-b-primary/70 border-l-primary rounded-full animate-spin-reverse" />

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>

        {/* Loading text with gradient */}
        <div className="flex flex-col items-center gap-2">
          <h1 className=" text-xl md:text-3xl font-bold bg-linear-to-b from-[#f5f5f5] to-white bg-clip-text text-transparent animate-pulse">
            {isArabic ? "جاري التحميل..." : "Loading..."}
          </h1>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0%,
          100% {
            width: 30%;
            margin-left: 0;
          }
          50% {
            width: 70%;
            margin-left: 30%;
          }
        }
      `}</style>
    </div>
  );
}

export default function MediaGallery({
  mediaFiles = [],
  imageUrls = [],
  videoUrls = [],
  className = "",
}: MediaGalleryProps) {
  const normalizeUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `/api/media/${url}`;
  };

  const buildImageItem = (url: string, originalName?: string): GalleryItem => {
    const normalized = normalizeUrl(url);
    return {
      type: "img",
      displayUrl: getDriveImageUrl(normalized, "w1200"),
      thumbnailUrl: getDriveImageUrl(normalized, "w400"),
      originalUrl: normalized,
      originalName,
    };
  };

  const buildVideoItem = (url: string, originalName?: string): GalleryItem => {
    const normalized = normalizeUrl(url);
    return {
      type: "video",
      displayUrl: getDriveVideoUrl(normalized),
      thumbnailUrl: getDriveImageUrl(normalized, "w400"),
      originalUrl: normalized,
      originalName,
    };
  };

  const media = useMemo(() => {
    const items = new Map<string, GalleryItem>();

    const addItem = (item: GalleryItem) => {
      if (!item.originalUrl) return;
      const key = `${item.type}-${item.originalUrl}`;
      if (items.has(key)) return;
      items.set(key, item);
    };

    mediaFiles.forEach((file) => {
      const isVideo = file.mimeType?.startsWith("video/");
      const entry = isVideo
        ? buildVideoItem(file.url, file.originalName)
        : buildImageItem(file.url, file.originalName);
      addItem(entry);
    });

    videoUrls.forEach((url) => addItem(buildVideoItem(url)));
    imageUrls.forEach((url) => addItem(buildImageItem(url)));

    return Array.from(items.values());
  }, [imageUrls, mediaFiles, videoUrls]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (media.length === 0) return null;

  const selectedMedia = media[selectedIndex];
  const handleSelectMedia = (index: number) => {
    setSelectedIndex(index);
    setIsLoading(true); // ✅ always show loader first
  };

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const openModal = (index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className={className}>
      {/* Main Display */}
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden group">
        {/* Loader Overlay for both images & videos */}
        {isLoading && <CreativeVideoLoader />}

        {selectedMedia.type === "img" ? (
          <Image
            fill
            alt={`Media ${selectedIndex + 1}`}
            src={selectedMedia.displayUrl}
            className="object-cover w-full h-full transition-opacity duration-500"
            loading="lazy"
            referrerPolicy="no-referrer"
            unoptimized={true} // Important for Google Drive images
            onLoad={() => setIsLoading(false)} // ✅ hide loader when image finishes loading
            onError={(e) => {
              console.warn("Failed to load image:", selectedMedia.displayUrl);
              setIsLoading(false);
              // Try to load with a different format
              const img = e.target as HTMLImageElement;
              if (img.src.includes("export=view")) {
                // Fallback to direct link
                const fileId = img.src.match(/id=([^&]+)/)?.[1];
                if (fileId) {
                  img.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
                }
              }
            }}
          />
        ) : (
          <div className="relative w-full overflow-hidden aspect-video bg-black rounded-lg group cursor-pointer">
            <iframe
              className="absolute top-0 left-0 w-full h-full border-0 rounded-lg shadow-xl"
              src={selectedMedia.displayUrl}
              title={`Video ${selectedIndex + 1}`}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
              onLoad={() => {
                setIsLoading(false);
                console.log("Video iframe loaded:", selectedMedia.displayUrl);
              }}
              onError={() => {
                setIsLoading(false);
                console.error(
                  "Video failed to load:",
                  selectedMedia.displayUrl
                );
              }}
            />
            {/* Video play indicator overlay - shows on hover */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 rounded-lg">
              <div className="bg-primary/80 rounded-full p-4 transform group-hover:scale-110 transition-transform">
                <Play className="w-12 h-12 text-white" fill="white" />
              </div>
            </div>
            {/* Click to play hint */}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {isArabic ? "انقر للعب" : "Click to play"}
            </div>
          </div>
        )}

        {/* Zoom Button */}
        <button
          onClick={() => openModal(selectedIndex)}
          className="absolute top-4 left-4 p-2 bg-primary/90 rounded-full hover:bg-primary duration-300 transition-colors z-10 cursor-pointer"
          aria-label="Zoom"
        >
          <Fullscreen className="w-5 h-5 text-white" />
        </button>

        {/* Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <span className="px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-gray-800">
            <span className="text-primary font-bold">{selectedIndex + 1}</span>{" "}
            / {media.length}
          </span>
        </div>

        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={isArabic ? handleNext : handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-primary/90 rounded-full hover:bg-primary transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={isArabic ? handlePrevious : handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-primary/90 rounded-full hover:bg-primary transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {media.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto p-2 scrollbar-thin scrollbar-thumb-primary scrollbar-track-primary">
          {media.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSelectMedia(index)}
              className={`relative flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden transition-all ${
                index === selectedIndex
                  ? "ring-4 ring-primary scale-105"
                  : "ring-2 ring-gray-300 hover:ring-gray-400 opacity-70 hover:opacity-100"
              }`}
            >
              {item.type === "img" ? (
                <Image
                  width={200}
                  height={200}
                  src={item.thumbnailUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="object-cover w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  unoptimized={true} // Important for Google Drive images
                  onError={(e) => {
                    console.warn(
                      "Failed to load thumbnail:",
                      item.thumbnailUrl
                    );
                    const img = e.target as HTMLImageElement;
                    if (img.src.includes("export=view")) {
                      // Fallback to direct link
                      const fileId = img.src.match(/id=([^&]+)/)?.[1];
                      if (fileId) {
                        img.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w200`;
                      }
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center relative group">
                  <Play className="w-8 h-8 text-white z-10" fill="white" />
                  {/* Try to show video thumbnail if available */}
                  {item.thumbnailUrl && (
                    <img
                      src={item.thumbnailUrl}
                      alt="Video thumbnail"
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity"
                      onError={(e) => {
                        // Hide thumbnail on error
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      {/* Fullscreen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
          <button
            onClick={closeModal}
            className="absolute  cursor-pointer top-4 right-4 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-[10000]"
            aria-label="Close"
          >
            <X className="w-7 h-7 text-white" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            {selectedMedia.type === "img" ? (
              <div className="relative w-full h-full flex items-center justify-center p-12">
                <Image
                  fill
                  alt={`Fullscreen ${selectedIndex + 1}`}
                  src={selectedMedia.displayUrl}
                  className="object-contain max-h-full"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    console.error(
                      "Image failed to load:",
                      selectedMedia.displayUrl
                    );
                  }}
                  onLoad={() => console.log("Image loaded successfully")}
                />
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <div className="relative w-full max-w-7xl aspect-video">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full border-0 rounded-lg shadow-xl"
                    src={selectedMedia.displayUrl}
                    title={`Video ${selectedIndex + 1}`}
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* Modal Navigation */}
            {media.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute cursor-pointer left-4 top-1/2 -translate-y-1/2 p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-[10000]"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute  cursor-pointer right-4 top-1/2 -translate-y-1/2 p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-[10000]"
                  aria-label="Next"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium text-lg">
              <span className="text-primary font-bold">
                {selectedIndex + 1}{" "}
              </span>{" "}
              / {media.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
