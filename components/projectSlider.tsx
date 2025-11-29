// app/components/ProjectSliderClient.tsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import GradientText from "./GradientText";
import { useTranslations, useLocale } from "next-intl";
import SafeImage from "./SafeImage";
import Link from "next/link";
import Image from "next/image";
//import DonationModalWrapper from "./DonationModalWrapper";

interface ProjectContent {
  language_code: string;
  name: string;
  description: string;
  content: string;
  images: string[];
  videos: string[];
  documents: string[];
}

interface Project {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  status: string;
  category: string;
  featured?: boolean;
  bannerPhotoUrl?: string;
  images?: string[];
  gallery?: Array<{
    id: string;
    url: string;
    alt: string;
    caption: string;
  }>;
  videos?: Array<{
    id: string;
    url: string;
    thumbnail?: string;
    title: string;
    duration?: string;
    description?: string;
  }>;
  allMedia?: any[];
  mediaCount?: {
    images: number;
    videos: number;
    total: number;
  };
  createdAt: Date;
  updatedAt: Date;
  // Legacy compatibility
  contents?: ProjectContent[];
  legacyGallery?: string[];
}
const getGoogleDriveId = (url: string): string | null => {
  const match = url?.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

const getImageUrl = (url: string): string => {
  // If it's a local path (starts with /), return as-is
  if (url && url.startsWith('/')) {
    return url;
  }
  
  // If it's a Google Drive URL, process it
  const fileId = getGoogleDriveId(url);
  return fileId
    ? `https://drive.google.com/uc?export=view&id=${fileId}`
    : url || "/homepage/01.webp"; // Use local fallback instead of external placeholder
};
export default function ProjectSliderClient({
  projects,
}: {
  projects: Project[];
}) {
  const p = useTranslations("projects");
  const locale = useLocale();
  const isArabic = locale === "ar";

  return (
    <div className="max-w-7xl mx-auto py-10">
      <Swiper
        dir={isArabic ? "rtl" : "ltr"}
        modules={[Pagination]}
        pagination={{ clickable: true }}
        loop={true}
        centeredSlides={false} // 👈 don't center on mobile
        slidesPerView={1} // 👈 one per view by default
        spaceBetween={15}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 30 },
        }}
      >
        {projects.map((proj) => {
          // Handle both new and legacy structures
          const localized = proj.contents?.find(
            (c) => c?.language_code === locale
          );
          
          // Get project title and description (new structure优先)
          const title = proj.title || localized?.name || 'Untitled Project';
          const description = proj.description || localized?.description || '';
          const shortDesc = proj.shortDescription || description?.substring(0, 100) || '';
          
          // Get banner image (new structure优先)
          const bannerImage = proj.bannerPhotoUrl || 
                            proj.images?.[0] || 
                            proj.gallery?.[0]?.url || 
                            '/homepage/01.webp';

          return (
            <SwiperSlide className="flex flex-col px-4" key={proj._id}>
              <Link key={proj._id} href={`/${locale}/projects/${proj._id}`}>
                <div
                  data-aos="fade-up"
                  className="flex group flex-col w-[355px] overflow-hidden mx-auto mb-10 transition-all duration-500"
                >
                  {/* Image Container with Enhanced Effects */}
                  <div className="relative overflow-hidden rounded-t-2xl shadow-lg">
                    <Image
                      width={200}
                      height={200}
                      alt={title}
                      src={getImageUrl(bannerImage)}
                      className="object-cover group-hover:scale-110 ease-in-out duration-700 w-full h-[200px]"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Content Container with Triangle Bottom */}
                  <div
                    className={`relative flex flex-col text-accent-foreground -mt-6 transform  transition-transform duration-500`}
                    dir={isArabic ? "rtl" : "ltr"}
                  >
                    {/* Enhanced Triangle Container */}
                    <div className="relative px-6  bg-gradient-to-b from-background to-gray-300 dark:from-gray-800 dark:to-gray-900 pt-6 pb-12 clip-bottom shadow-xl group-hover:shadow-2xl transition-all duration-500 border-t-4 border-primary/20 group-hover:border-primary/40">
                      {/* Subtle Corner Accent */}
                      <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-br-full" />
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

                      {/* Title with Enhanced Bar */}
                      <div
                        className={`flex justify-end  transition-all duration-300  gap-2 mb-3`}
                      >
                        <div className="w-1.5 h-9 bg-gradient-to-b from-primary to-primary group-hover:from-primary group-hover:to-primary/80 rounded-full  transition-all duration-300" />
                        <h1
                          className={`text-2xl flex-1 ${
                            isArabic ? "text-right" : "text-left"
                          } font-almarai font-bold`}
                        >
                          <GradientText
                            colors={["#d23e3e", "#000000", "#d23e3e"]}
                            darkColors={["#d23e3e", "#d84040", "#ECDFCC"]}
                            animationSpeed={10}
                            showBorder={false}
                            className={`line-clamp-1 font-almarai font-extrabold`}
                          >
                            {title}
                          </GradientText>
                        </h1>
                      </div>

                      {/* Description with better spacing */}
                      <p
                        className={`text-md font-bold line-clamp-4 mb-3 leading-relaxed ${
                          isArabic ? "text-right" : "text-left"
                        }`}
                      >
                        {shortDesc}
                      </p>

                      {/* Content */}
                      {/* <p
                        className={`text-sm text-gray-700 dark:text-gray-300  font-medium line-clamp-3 mb-5 leading-relaxed ${
                          isArabic ? "text-right" : "text-left"
                        }`}
                      >
                        {localized?.content ?? ""}
                      </p> */}

                      {/* Divider */}
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-5" />

                      {/* Media Count Display */}
                      {proj.mediaCount && proj.mediaCount.total > 0 && (
                        <div className="flex justify-center gap-4 mb-4 text-xs text-muted-foreground">
                          {proj.mediaCount.images > 0 && (
                            <span className="flex items-center gap-1">
                              📸 {proj.mediaCount.images}
                            </span>
                          )}
                          {proj.mediaCount.videos > 0 && (
                            <span className="flex items-center gap-1">
                              🎥 {proj.mediaCount.videos}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Enhanced Donate Button with Better Effects */}
                      <Link href={`/${locale}/donate`}>
                        <div className="flex justify-center">
                          <button className="relative  bg-primary hover:bg-primary/90 text-white font-bold px-7 py-3 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group/btn overflow-hidden">
                            {/* Background Animation */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />

                            <span className="relative z-10 flex items-center gap-2">
                              {p("singleproject.donate")}
                            </span>

                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                          </button>
                        </div>
                      </Link>
                    </div>

                    {/* Bottom Triangle Shadow - Subtle */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-primary/5 dark:bg-primary/10 rounded-full blur-xl" />
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
