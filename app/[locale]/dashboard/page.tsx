"use client";

//dashboard/page.tsx
import AwesomeDashboard from "@/components/dashboard/AwesomeDashboard";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth";
import { useSession } from "next-auth/react";
import React from "react";

const DashboardPage = ({ params }: { params: Promise<{ locale: string }> }) => {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <AwesomeDashboard />
    </div>
  );
};

export default DashboardPage;
