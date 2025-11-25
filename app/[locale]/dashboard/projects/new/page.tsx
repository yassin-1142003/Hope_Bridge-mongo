import { Metadata } from "next";
import ProjectForm from "@/components/ProjectForm";

export const metadata: Metadata = {
  title: "Create New Project | Hope Bridge",
  description: "Create a new Hope Bridge project",
};

export default function NewProjectPage() {
  return <ProjectForm />;
}
