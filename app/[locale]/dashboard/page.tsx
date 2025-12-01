//dashboard/page.tsx
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "@/lib/auth";
import Link from "next/link";
import React from "react";
import { Shield, Users, BarChart3, Settings, Link2, ArrowRight } from "lucide-react";
import RoleBasedTaskDashboard from "@/components/dashboard/RoleBasedTaskDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const session = await getServerSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            {isArabic ? "لوحة التحكم" : "Dashboard"}
          </h1>
          <p className="text-lg text-accent-foreground">
            {session?.user?.email}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? "المهام" : "Tasks"}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/tasks">
                <Button className="w-full cursor-pointer">
                  {isArabic ? "إدارة المهام" : "Manage Tasks"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? "المشاريع" : "Projects"}
              </CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link href={`/${locale}/projects`}>
                <Button variant="outline" className="w-full cursor-pointer">
                  {isArabic ? "عرض المشاريع" : "View Projects"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {session?.user?.role === "ADMIN" && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isArabic ? "المدير" : "Admin"}
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/projectDashboard">
                  <Button variant="outline" className="w-full cursor-pointer">
                    {isArabic ? "لوحة التحكم الخاصة" : "Admin Dashboard"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? "الإعدادات" : "Settings"}
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full cursor-pointer" disabled>
                {isArabic ? "قريباً" : "Coming Soon"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Task Dashboard Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-white">
              {isArabic ? "نظرة عامة على المهام" : "Task Overview"}
            </h2>
          </div>
          
          {/* Role-Based Task Dashboard */}
          <div className="bg-white rounded-2xl p-4">
            <RoleBasedTaskDashboard className="w-full" />
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8 text-center">
          <LogoutButton params={locale} />
        </div>
      </div>
    </div>
  );
};

export default page;
