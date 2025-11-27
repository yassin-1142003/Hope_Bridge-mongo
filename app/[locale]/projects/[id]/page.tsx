import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import GradientText from "@/components/GradientText";
import type { PageProps } from "@/types/next";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SuggestProj from "@/components/SuggestProj";
import DonationModalWrapper from "@/components/DonationModalWrapper";
import Image from "next/image";
import { ProjectService } from "@/lib/services/ProjectService";
import MediaGallery from "@/components/MediaGallery";

type LocalizedContent = {
  id: string;
  language_code: string;
  name: string;
  description: string;
  content: string;
  images: string[];
  videos: string[];
  documents: string[];
};
import { extractDriveFileId, getDriveImageUrl, getDriveVideoUrl } from "@/lib/driveUtils";

const extractIdFromSlug = (slug: string): string => {
  // UUID format: 8-4-4-4-12 characters (with hyphens)
  // Match UUID pattern at the end of the slug
  const uuidRegex =
    /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i;
  const match = slug.match(uuidRegex);

  if (match) {
    return match[1];
  }

  // Fallback: if no UUID found, try to match ObjectId format (24 hex chars)
  const objectIdRegex = /([a-f0-9]{24})$/i;
  const objectIdMatch = slug.match(objectIdRegex);
  
  if (objectIdMatch) {
    return objectIdMatch[1];
  }

  // Final fallback: if the entire slug is a valid ObjectId
  if (/^[a-f0-9]{24}$/i.test(slug)) {
    return slug;
  }

  console.warn("Could not extract valid ID from slug:", slug);
  return slug;
};

// const getImageUrl = (url: string): string => {
//   const fileId = getGoogleDriveId(url);
//   return fileId
//     ? `https://drive.google.com/uc?export=view&id=${fileId}`
//     : url || "https://placehold.net/600x400.png?text=No+Image";
// };

export default async function ProjectPage({
  params,
}: PageProps<{ id: string; locale: string }>) {
  const { id: slugOrId, locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  const session = await getServerSession(authOptions);

  // Extract actual ID from slug or use direct ID (same logic as API)
  const extractIdFromSlug = (slug: string): string => {
    // UUID format: 8-4-4-4-12 characters (with hyphens)
    const uuidRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i;
    const match = slug.match(uuidRegex);

    if (match) {
      return match[1];
    }

    // Fallback: if no UUID found, try to match ObjectId format (24 hex chars)
    const objectIdRegex = /([a-f0-9]{24})$/i;
    const objectIdMatch = slug.match(objectIdRegex);
    
    if (objectIdMatch) {
      return objectIdMatch[1];
    }

    // Final fallback: if the entire slug is a valid ObjectId
    if (/^[a-f0-9]{24}$/i.test(slug)) {
      return slug;
    }

    return slug; // Return as-is if no pattern matches
  };
  
  const actualId = extractIdFromSlug(slugOrId);
  console.log(`🔍 ProjectPage looking for: ${slugOrId} -> extracted ID: ${actualId}`);

  const projectService = new ProjectService();
  const projectWithMedia = await projectService.getProjectWithMedia(actualId);

  if (!projectWithMedia) return notFound();

  const localized =
    projectWithMedia.contents?.find(
      (c: any) => c.language_code === locale
    ) ||
    projectWithMedia.contents?.find((c: any) => c.language_code === "en");

  if (!localized) return notFound();

  const isArabic = locale === "ar";

  // Prepare media for gallery - convert URLs to MediaFile format
  const imageUrls = [
    ...(projectWithMedia.gallery || []),
    ...(localized.images || [])
  ];
  
  const videoUrls = localized.videos || [];
  
  // Create MediaFile objects from URLs
  const mediaFiles = imageUrls.map((url, index) => ({
    id: `img-${index}`,
    filename: `image-${index}`,
    originalName: `Image ${index + 1}`,
    mimeType: 'image/jpeg',
    size: 0,
    url: url,
    uploaded_at: new Date().toISOString()
  }));

  console.log(`🖼️ Media for ${localized.name}:`, {
    gallery: projectWithMedia.gallery?.length || 0,
    images: localized.images?.length || 0,
    videos: localized.videos?.length || 0,
    totalImages: imageUrls.length,
    totalVideos: videoUrls.length,
    totalMedia: mediaFiles.length + videoUrls.length
  });

  return (
    <main
      className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 "
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto py-0 space-y-12">
        {/* Hero Section with Media */}
        <section className="relative">
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden">
            {projectWithMedia.bannerPhotoUrl ? (
              <Image
                src={getDriveImageUrl(projectWithMedia.bannerPhotoUrl, "w1200")}
                alt={localized.name}
                fill
                className="object-cover"
                unoptimized={projectWithMedia.bannerPhotoUrl.includes("drive.google.com")}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">No Image</span>
              </div>
            )}
          </div>
        </section>

        {/* Media Gallery */}
        {(mediaFiles.length > 0 || videoUrls.length > 0) && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {isArabic ? "معرض الصور والفيديو" : "Media Gallery"}
            </h2>
            <MediaGallery 
              mediaFiles={mediaFiles} 
              imageUrls={imageUrls}
              videoUrls={videoUrls}
              className="w-full" 
            />
          </section>
        )}

        {/* Project Header */}
        <section dir={isArabic ? "rtl" : "ltr"} className="  space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            <GradientText
              colors={["#d23e3e", "#000000", "#d23e3e"]}
              darkColors={["#d23e3e", "#d84040", "#ECDFCC"]}
              animationSpeed={3}
              className="font-almarai"
            >
              {localized.name}
            </GradientText>
          </h1>

          <p
            className={`text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto md:mx-0 ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            {localized.description}
          </p>
        </section>

        {/* Content Section */}
        <section
          dir={isArabic ? "rtl" : "ltr"}
          className={`relative bg-gradient-to-br from-[#ffffff] to-[#ffffff]  dark:from-gray-900 dark:to-gray-800 backdrop-blur-md p-6 md:p-10 rounded-2xl shadow-lg transition-all`}
        >
          <div
            className={`prose prose-lg dark:prose-invert max-w-none leading-relaxed whitespace-pre-line ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            {localized.content}
          </div>
        </section>

        {/* Action Bar */}
        <section className=" bottom-6 flex justify-center">
          <div>
            <Link href={`/${locale}/donate`}>
              <Button className="font-bold cursor-pointer">
                {t("singleproject.donate")}
              </Button>
            </Link>
            {/* <DonationModalWrapper locale={locale} /> */}
          </div>
          {!(!session || session.user.role !== "manager") && (
            <div className="flex gap-3 px-5 items-center">
              <Link href={`/${locale}/dashboard/projects/edit/${projectWithMedia.id}`}>
                <PencilIcon className="w-5 h-5" />
              </Link>
            </div>
          )}
        </section>
      </div>
      <div className="flex items-center justify-center">
        <div className="h-[1px] w-3/4 my-5 self-center bg-gray-500/50"></div>
      </div>
      <section
        className={`w-full mx-auto pb-10 ${
          isArabic ? "rtl text-right" : "ltr text-left"
        }`}
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className={`flex w-full  flex-row  justify-between items-center `}>
          <h2 className=" mx-auto  md:text-2xl text-lg font-extrabold text-primary border-b-4 border-primary/40 pb-2">
            {isArabic ? " مشاريع ذات صلة" : "Related Projects"}
          </h2>
        </div>
        <SuggestProj locale={locale} />
      </section>
    </main>
  );
}
