// app/components/ProjectSlider.tsx

import ProjectSliderClient from "@/components/projectSlider";
import { getTranslations } from "next-intl/server";

interface ProjectContent {
  id: number;
  project_id: number;
  language_code: string;
  name: string;
  description: string;
  content: string;
}

interface Project {
  id: number;
  images: string;
  created_at: string;
  contents: ProjectContent[];
}

export default async function ProjectSlider({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // ✅ fetch server-side
  const res = await fetch(`${baseUrl}/api/post/project`, {
    method: "GET",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    console.error("Failed to fetch projects");
    return <p className="text-red-500">Failed to load projects.</p>;
  }

  const { details }: { details: Project[] } = await res.json();

  // ✅ Pass only first 10 projects to client
  const projects = details.slice(0, 10);
  // const { locale } = await params;
  const p = await getTranslations({ locale, namespace: "projects" });

  return (
    <>
      <div
        data-aos="fade-up"
        className="flex  flex-col px-5 justify-center items-center text-center "
      >
        <div className="flex items-center w-full gap-4">
          <div className="h-1 flex-1 bg-gradient-to-l w-full from-gray-400 to-transparent" />
          <h1 className="text-3xl md:text-5xl text-primary font-extrabold drop-shadow-lg">
            {p("title")}
          </h1>
          <div className="h-1 flex-1 bg-gradient-to-l w-full  from-transparent to-gray-400" />
        </div>

        <p className="mt-4 text-lg md:text-xl text-accent-foreground font-bold">
          {p("subtitle")}
        </p>
      </div>
      <ProjectSliderClient projects={projects} />
    </>
  );
}
