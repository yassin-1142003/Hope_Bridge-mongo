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
import ProjectCard from "@/components/ProjectCard";

type ProjectLocalizedContent = {
  id: string;
  project_id: number;
  language_code: string;
  name: string;
  description: string;
  content: string;
  images: string[];
  videos: string[];
  documents: string[];
};

type ProjectContent = {
  id: string;
  bannerPhotoUrl: string;
  bannerPhotoId?: string;
  gallery: string[];
  created_at: string;
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
    ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`
    : url || "https://placehold.net/600x400.png?text=No+Image";
};

const Page = async ({ params }: PageProps<{ locale: string }>) => {
  const { locale } = await params;
  const p = await getTranslations({ locale, namespace: "projects" });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002";

  console.log('🔄 Fetching projects from MongoDB...');
  
  const res = await fetch(`${baseUrl}/api/projects`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error('❌ Failed to fetch projects:', res.status, res.statusText);
    throw new Error("Failed to fetch projects");
  }

  const { data } = await res.json();
  console.log(`✅ Retrieved ${data?.length || 0} projects from MongoDB`);
  
  // Debug: Log the first project structure
  if (data && data.length > 0) {
    console.log('🔍 First project structure:', {
      id: data[0].id,
      idType: typeof data[0].id,
      bannerPhotoUrl: data[0].bannerPhotoUrl?.substring(0, 50),
      galleryCount: data[0].gallery?.length,
      contentsCount: data[0].contents?.length
    });
  }

  const isArabic = locale === "ar";
  
  // Limit initial load to first 6 projects to reduce timeout issues
  const initialProjects = data?.slice(0, 6) || [];
  const filteredProjects = initialProjects.filter((proj: ProjectContent) => {
    // Debug: Log the structure of each project
    console.log(`🔍 Project ${proj.id}:`, {
      hasContents: !!proj.contents,
      contentsType: typeof proj.contents,
      contentsLength: proj.contents?.length,
      contents: proj.contents?.map(c => ({
        language_code: c.language_code,
        name: c.name,
        hasName: !!c.name
      }))
    });
    
    const localizedContent = proj.contents?.find(
      (c) => c?.language_code === locale
    );
    
    // Fallback: if no exact match, try to find any content with a name
    const fallbackContent = !localizedContent && proj.contents?.find(
      (c) => c?.name && c.name.trim() !== ""
    );
    
    const contentToUse = localizedContent || fallbackContent;
    
    return Boolean(contentToUse && contentToUse.name && contentToUse.name.trim() !== "");
  });

  console.log(`📝 ${filteredProjects?.length || 0} projects available in locale: ${locale}`);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <GradientText
              colors={["#d23e3e", "#000000", "#d23e3e"]}
              darkColors={["#d23e3e", "#d84040", "#ECDFCC"]}
              animationSpeed={3}
              className="font-almarai"
            >
              {p("title")}
            </GradientText>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {p("subtitle")}
          </p>
        </div>

        {/* Projects Grid */}
        {filteredProjects && filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project: ProjectContent) => (
              <ProjectCard key={project.id} project={project} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              {isArabic ? "لا توجد مشاريع حالياً" : "No projects available at the moment"}
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <DonationModalWrapper locale={locale} />
        </div>
      </div>
    </main>
  );
}

export default Page;
