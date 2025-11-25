import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/ProjectForm";
import { ProjectService } from "@/lib/services/ProjectService";

const projectService = new ProjectService();

export const metadata: Metadata = {
  title: "Edit Project | Hope Bridge",
  description: "Edit Hope Bridge project",
};

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  
  try {
    const project = await projectService.getProjectById(id);
    
    if (!project) {
      notFound();
    }

    return <ProjectForm initialData={project} projectId={id} />;
  } catch (error) {
    console.error("Error fetching project:", error);
    notFound();
  }
}
