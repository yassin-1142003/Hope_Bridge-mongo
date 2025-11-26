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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/project`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch details");

  // ✅ API should return { projects }
  const { details } = await res.json();
  console.log(details);
  // 🔥 Re-map API response to match existing frontend structure
  const mappedProjects = details.map((proj: any) => {
    return {
      id: proj.id,
      images: proj.gallery || [], // array of images
      banner: proj.bannerPhotoUrl,
      created_at: proj.created_at,
      contents: proj.contents.map((c: any) => ({
        id: proj.id,
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
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-5" />

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
          );
        })}
      </section>
    </main>
  );
};

export default Page;
