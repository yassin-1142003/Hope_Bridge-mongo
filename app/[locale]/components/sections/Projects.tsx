"use client";

// app/components/ProjectSlider.tsx

import ProjectSliderClient from "@/components/projectSlider";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import axios from "axios";

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
  contents: ProjectContent[];
  bannerPhotoUrl: string;
  bannerPhotoId?: string;
  imageGallery: string[];
  videoGallery: string[];
  createdAt: Date;
  updatedAt: Date;
}

export default function ProjectSlider({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations("HomePage");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log("🔄 Projects API - Fetching from API");
        
        const response = await axios.get(`/api/projects`);
        setProjects(response.data.data || []);
        
        console.log(
          "✅ Projects API - Successfully loaded",
          response.data.data?.length || 0,
          "projects"
        );
      } catch (error) {
        console.error("❌ Projects API - Failed to load projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <section className="py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading projects...</p>
        </div>
      </section>
    );
  }

    // Convert MongoDB documents to Project type
  const projectsWithIds: Project[] = projects.map((project: any) => ({
    _id: project._id?.toString() || "",
    contents: project.contents || [],
    bannerPhotoUrl: project.bannerPhotoUrl || "",
    bannerPhotoId: project.bannerPhotoId,
    imageGallery: project.imageGallery || [],
    videoGallery: project.videoGallery || [],
    createdAt: project.createdAt || new Date(),
    updatedAt: project.updatedAt || new Date(),
  }));

  const p = useTranslations("projects");

  return (
    <>
      <div
        data-aos="fade-up"
        className="flex flex-col px-5 justify-center items-center text-center "
      >
        <div className="flex items-center w-full gap-4 mb-8">
          <div className="h-1 flex-1 bg-gradient-to-l w-full from-gray-400 to-transparent" />
          <h1 className="text-4xl md:text-6xl text-primary font-extrabold drop-shadow-lg">
            {p("title")}
          </h1>
          <div className="h-1 flex-1 bg-gradient-to-l w-full  from-transparent to-gray-400" />
        </div>

        <p className="mt-6 text-xl md:text-2xl text-accent-foreground font-bold max-w-4xl">
          {p("subtitle")}
        </p>
      </div>
      <ProjectSliderClient projects={projectsWithIds} />
    </>
  );
}
