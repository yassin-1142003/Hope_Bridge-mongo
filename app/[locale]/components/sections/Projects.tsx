"use client";

// app/components/ProjectSlider.tsx

import ProjectSliderClient from "@/components/projectSlider";
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { getTranslations } from "next-intl/server";
import { getCollection } from "@/lib/mongodb";
=======
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import axios from "axios";
>>>>>>> Stashed changes
=======
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import axios from "axios";
>>>>>>> Stashed changes
=======
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import axios from "axios";
>>>>>>> Stashed changes
=======
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import axios from "axios";
>>>>>>> Stashed changes
=======
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import axios from "axios";
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  try {
    // ✅ Direct MongoDB call - no HTTP request needed
    console.log("🔄 Projects API - Fetching from MongoDB directly");

    const projectsCollection = await getCollection("projects");
    const projects = await projectsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    console.log(
      "✅ Projects API - Successfully loaded",
      projects.length,
      "projects"
    );

    // Convert MongoDB documents to Project type
    const projectsWithIds: Project[] = projects.map((project) => ({
      _id: project._id.toString(),
      contents: project.contents || [],
      bannerPhotoUrl: project.bannerPhotoUrl || "",
      bannerPhotoId: project.bannerPhotoId,
      imageGallery: project.imageGallery || [],
      videoGallery: project.videoGallery || [],
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));

    const p = await getTranslations({ locale, namespace: "projects" });

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
=======
  const t = useTranslations("HomePage");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

=======
  const t = useTranslations("HomePage");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

>>>>>>> Stashed changes
=======
  const t = useTranslations("HomePage");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

>>>>>>> Stashed changes
=======
  const t = useTranslations("HomePage");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

>>>>>>> Stashed changes
=======
  const t = useTranslations("HomePage");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        </div>
        <ProjectSliderClient projects={projectsWithIds} />
      </>
    );
  } catch (error: any) {
    console.error("❌ Projects API - Connection error:", error.message);

<<<<<<< Updated upstream
    // Return fallback projects when API fails
    const fallbackProjects: Project[] = [
      {
        _id: "fallback-1",
        contents: [
          {
            language_code: locale,
            name: "Community Garden Project",
            description:
              "Transforming unused spaces into thriving community gardens",
            content: "Urban gardening initiative for sustainable living",
            images: ["/homepage/02.webp", "/homepage/03.webp"],
            videos: [],
            documents: [],
          },
        ],
        bannerPhotoUrl: "/homepage/01.webp",
        imageGallery: [
          "/homepage/01.webp",
          "/homepage/02.webp",
          "/homepage/03.webp",
        ],
        videoGallery: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "fallback-2",
        contents: [
          {
            language_code: locale,
            name: "Youth Education Initiative",
            description:
              "Providing educational resources and mentorship to underprivileged youth",
            content: "Education empowerment program for young minds",
            images: ["/aboutus/hero2.webp", "/aboutus/hero3.webp"],
            videos: [],
            documents: [],
          },
        ],
        bannerPhotoUrl: "/aboutus/hero.webp",
        imageGallery: [
          "/aboutus/hero.webp",
          "/aboutus/hero2.webp",
          "/aboutus/hero3.webp",
        ],
        videoGallery: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    console.log(
      "🔄 Projects API - Using fallback projects due to connection error"
    );
    const p = await getTranslations({ locale, namespace: "projects" });

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
        <ProjectSliderClient projects={fallbackProjects} />
      </>
    );
  }
=======
        <p className="mt-6 text-xl md:text-2xl text-accent-foreground font-bold max-w-4xl">
          {p("subtitle")}
        </p>
      </div>
      <ProjectSliderClient projects={projectsWithIds} />
    </>
  );
>>>>>>> Stashed changes
}
