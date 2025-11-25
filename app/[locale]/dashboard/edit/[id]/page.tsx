// projects/[id]/edit/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import ProjectContentForm from "@/components/ProjectContentForm";
type ProjectLocalizedContent = {
  id: string;
  project_id: number;
  language_code: string;
  name: string;
  images: string[];
  videos: string[];
  description: string;
  content: string;
};
type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "manager") {
    return notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/post/project/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch project:", res.status);
      return notFound();
    }

    const { details } = await res.json();

    if (!details) {
      return notFound();
    }

    // Prepare langs array for form
    const langs = details.contents?.map((c: ProjectLocalizedContent) => ({
      code: c.language_code,
    })) || [{ code: "en" }, { code: "ar" }]; // fallback langs

    // Prepare project data for editing
    const projectData = {
      id: details.id,
      images: details.images,
      category: details.category,
      contents: details.contents,
    };

    return (
      <div className="min-h-screen py-8">
        <ProjectContentForm langs={langs} project={projectData} isEdit={true} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching project:", error);
    return notFound();
  }
}
