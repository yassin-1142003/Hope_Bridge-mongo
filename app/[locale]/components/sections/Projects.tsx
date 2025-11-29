// app/components/ProjectSlider.tsx

import ProjectSliderClient from "@/components/projectSlider";
import { getTranslations } from "next-intl/server";

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
  gallery: string[];
  createdAt: Date;
  updatedAt: Date;
}

export default async function ProjectSlider({
  params: { locale },
}: {
  params: { locale: string };
}) {
  // ✅ fetch server-side
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002";
  const res = await fetch(`${baseUrl}/api/projects`, {
    method: "GET",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    console.error("Failed to fetch projects");
    return <p className="text-red-500">Failed to load projects.</p>;
  }

  const { data: details }: { data: Project[] } = await res.json();

  // ✅ Pass only first 10 projects to client
  const projects = details.slice(0, 10);
  // const { locale } = await params;
  const p = await getTranslations({ locale, namespace: "projects" });

  return (
    <>
      <div
        data-aos="fade-up"
        className="flex flex-col px-5 justify-center items-center text-center "
      >
        <div className="flex items-center w-full gap-4 mb-8">
          <div className="h-1 flex-1 bg-linear-to-l w-full from-gray-400 to-transparent" />
          <h1 className="text-4xl md:text-6xl text-primary font-extrabold drop-shadow-lg">
            {p("title")}
          </h1>
          <div className="h-1 flex-1 bg-linear-to-l w-full  from-transparent to-gray-400" />
        </div>

        <p className="mt-6 text-xl md:text-2xl text-accent-foreground font-bold max-w-4xl">
          {p("subtitle")}
        </p>
      </div>
      <ProjectSliderClient projects={projects} />
    </>
  );
}
