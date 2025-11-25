import { Metadata } from "next";
import ProjectsList from "@/components/ProjectsList";

export const metadata: Metadata = {
  title: "Projects Management | Hope Bridge",
  description: "Manage Hope Bridge projects",
};

export default function ProjectsPage() {
  return <ProjectsList />;
}
