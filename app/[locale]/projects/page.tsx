//projects/page.tsx

import { getTranslations } from "next-intl/server";
import React from "react";
import GradientText from "@/components/GradientText";
import slugify from "slugify";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import type { PageProps } from "@/types/next";
import DonationModalWrapper from "@/components/DonationModalWrapper";
import Image from "next/image";

type ProjectLocalizedContent = {
  id: string;
  project_id: number;
  language_code: string;
  name: string;
  description: string;
  content: string;
};

type ProjectContent = {
  id: string;
  images: string;
  created_at: string;
  category: string;
  contents: ProjectLocalizedContent[];
};
// ✅ Convert Google Drive links to direct image URLs
const getGoogleDriveId = (url: string): string | null => {
  const match = url?.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};
const createProjectSlug = (name: string, id: string): string => {
  const titleSlug = slugify(name || "untitled", {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g, // Remove special characters
  });

  // Combine title slug with UUID: "project-name-uuid"
  return `${titleSlug}-${id}`;
};
const getImageUrl = (url: string): string => {
  const fileId = getGoogleDriveId(url);
  return fileId
    ? `https://drive.google.com/uc?export=view&id=${fileId}`
    : url || "https://placehold.net/600x400.png?text=No+Image";
};

const Page = async ({ params }: PageProps<{ locale: string }>) => {
  const { locale } = await params;
  const p = await getTranslations({ locale, namespace: "projects" });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

  let projects = [];
  let hasError = false;
  let errorMessage = "";

  try {
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      hasError = true;
      errorMessage = `API Error: ${res.status} ${res.statusText}`;
      console.error('Projects API Error:', errorMessage);
      throw new Error(errorMessage);
    }

    // ✅ API returns projects directly in response data
    const responseData = await res.json();
    projects = responseData.data || responseData;
    console.log('API Response:', projects);
  } catch (error) {
    hasError = true;
    errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error('Failed to fetch projects:', errorMessage);
    
    // Provide fallback mock data for development
    projects = [
      {
        _id: "mock-project-1",
        bannerPhotoUrl: "https://images.unsplash.com/photo-1488521787951-7083234c57eb?w=800",
        imageGallery: [
          "https://images.unsplash.com/photo-1488521787951-7083234c57eb?w=800",
          "https://images.unsplash.com/photo-1469571486292-c0f3ee937b5b?w=800"
        ],
        contents: [
          {
            language_code: locale,
            name: locale === 'ar' ? "مشروع المياه النظيفة" : "Clean Water Project",
            description: locale === 'ar' ? "توفير مياه نظيفة للمناطق المحتاجة" : "Providing clean water to needy areas",
            content: locale === 'ar' ? "هذا المشروع يهدف إلى توفير مياه نظيفة وآمنة للمناطق المحتاجة." : "This project aims to provide clean and safe water to needy areas."
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: "mock-project-2",
        bannerPhotoUrl: "https://images.unsplash.com/photo-1509099836639-18ba1795216c?w=800",
        imageGallery: [
          "https://images.unsplash.com/photo-1509099836639-18ba1795216c?w=800",
          "https://images.unsplash.com/photo-1520335782732-749908f5df25?w=800"
        ],
        contents: [
          {
            language_code: locale,
            name: locale === 'ar' ? "مشروع التعليم" : "Education Project",
            description: locale === 'ar' ? "دعم التعليم للأطفال المحتاجين" : "Supporting education for needy children",
            content: locale === 'ar' ? "هذا المشروع يهدف إلى دعم التعليم للأطفال في المناطق المحتاجة." : "This project aims to support education for children in needy areas."
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
  // 🔥 Re-map API response to match existing frontend structure
  const mappedProjects = projects.map((proj: any) => {
    return {
      id: proj._id,
      images: proj.gallery || [], // array off images
      banner: proj.bannerPhotoUrl,
      created_at: proj.createdAt,
      contents: proj.contents.map((c: any) => ({
        id: proj._id,
        language_code: c.language_code,
        name: c.name,
        description: c.description,
        content: c.content,
        images: c.images || [],
      })),
    };
  });

  const isArabic = locale === "ar";

  const filteredProjects = mappedProjects.filter((proj: any) => {
    const localizedContent = proj.contents.find(
      (c: any) => c.language_code === locale
    );
    return Boolean(
      localizedContent?.name && localizedContent.name.trim() !== ""
    );
  });

  return (
    <main className="min-h-screen">
      <div className="flex  flex-col justify-center items-center text-center  ">
        <h1 className="text-3xl md:text-5xl text-primary font-extrabold drop-shadow-lg">
          {p("title")}
        </h1>
        <p className="mt-4 text-lg md:text-xl text-accent-foreground font-bold">
          {p("subtitle")}
        </p>
      </div>

      {/* Error Notification */}
      {hasError && (
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-semibold">
                  {locale === 'ar' ? 'تنبيه' : 'Notice'}
                </h3>
                <p className="text-sm">
                  {locale === 'ar' 
                    ? 'يتم عرض بيانات تجريبية. قد تكون هناك مشكلة في الاتصال بقاعدة البيانات.' 
                    : 'Showing sample data. There may be an issue connecting to the database.'
                  }
                </p>
                {errorMessage && (
                  <p className="text-xs mt-1 opacity-75">
                    {locale === 'ar' ? 'خطأ:' : 'Error:'} {errorMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Render details list */}
      <section
        dir={isArabic ? "rtl" : "ltr"}
        className="flex flex-wrap justify-center gap-8 px-3 py-10"
      >
        {filteredProjects?.map((proj: ProjectContent) => {
          const localizedContent = proj.contents.find(
            (c) => c.language_code === locale
          );
          const projectSlug = createProjectSlug(
            localizedContent?.name || "untitled",
            proj.id
          );
          return (
            <Link key={proj.id} href={`/${locale}/projects/${proj.id}`}>
              <div
                data-aos="fade-up"
                className="flex group flex-col w-[355px] overflow-hidden mx-auto mb-10 transition-all duration-500"
              >
                {/* Image Container with Enhanced Effects */}
                <div className="relative overflow-hidden rounded-t-2xl shadow-lg">
                  <Image
                    width={1000}
                    height={1000}
                    alt={localizedContent?.name ?? "Project Image"}
                    src={getImageUrl(proj.images[0])}
                    className="object-cover group-hover:scale-110 ease-in-out duration-700 w-full h-[220px]"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content Container with Triangle Bottom */}
                <div
                  className={`relative flex flex-col text-accent-foreground -mt-6 transform  transition-transform duration-500`}
                  dir={isArabic ? "rtl" : "ltr"}
                >
                  {/* Enhanced Triangle Container */}
                  <div className="relative px-6  bg-linear-to-b from-background to-gray-300 dark:from-gray-800 dark:to-gray-900 pt-6 pb-12 clip-bottom shadow-xl group-hover:shadow-2xl transition-all duration-500 border-t-4 border-primary/20 group-hover:border-primary/40">
                    {/* Subtle Corner Accent */}
                    <div className="absolute top-0 left-0 w-20 h-20 bg-linear-to-br from-primary/10 to-transparent rounded-br-full" />
                    <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-bl from-primary/10 to-transparent rounded-bl-full" />

                    {/* Title with Enhanced Bar */}
                    <div
                      className={`flex justify-end  transition-all duration-300  gap-2 mb-3`}
                    >
                      <div className="w-1.5 h-9 bg-linear-to-b from-primary to-primary group-hover:from-primary group-hover:to-primary/80 rounded-full  transition-all duration-300" />
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
                          {localizedContent?.name ?? "Untitled"}
                        </GradientText>
                      </h1>
                    </div>

                    {/* Description with better spacing */}
                    <p
                      className={`text-md font-bold line-clamp-2 mb-3 leading-relaxed ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {localizedContent?.description ?? ""}
                    </p>

                    {/* Content */}
                    <p
                      className={`text-sm text-gray-700 dark:text-gray-300  font-medium line-clamp-3 mb-5 leading-relaxed ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    >
                      {localizedContent?.content ?? ""}
                    </p>

                    {/* Divider */}
                    <div className="w-full h-px bg-linear-to-r from-transparent via-primary/50 to-transparent mb-5" />

                    {/* Enhanced Donate Button with Better Effects */}
                    <Link href={`/${locale}/donate`}>
                      <div className="flex justify-center">
                        <button className="relative  bg-primary hover:bg-primary/90 text-white font-bold px-7 py-3 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group/btn overflow-hidden">
                          {/* Background Animation */}
                          <div className="absolute inset-0 bg-linear-to-r from-primary/50 to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />

                          <span className="relative z-10 flex items-center gap-2">
                            {p("singleproject.donate")}
                          </span>

                          {/* Shine Effect */}
                          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        </button>
                      </div>
                    </Link>
                  </div>

                  {/* Bottom Triangle Shadow - Subtle */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-primary/5 dark:bg-primary/10 rounded-full blur-xl" />
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
};

export default Page;
