//dashboard/projectDashboard/page.tsx
import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import ProjectContentForm from "@/components/ProjectContentForm";
import { authOptions } from "@/lib/auth";

export default async function projectDashboard() {
  const session = await getServerSession(authOptions);
  const langs = await db
    .select({ code: true })
    .from({});

  // If not logged in, or not a manager → redirect home
  if (!session || session.user.role !== "manager") {
    redirect("/"); // send them home
  }

  // If authorized
  return (
    <div className="text-2xl min-h-[90svh] flex justify-center items-center text-primary">
      <ProjectContentForm langs={langs} />
    </div>
  );
}
