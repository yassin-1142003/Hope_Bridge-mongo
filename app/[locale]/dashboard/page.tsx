//dashboard/page.tsx
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "@/lib/auth";
import Link from "next/link";
import React from "react";

const DashboardPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const session = await getServerSession();

  return (
    <div className="min-h-[60svh]  flex flex-col items-center  text-center justify-center gap-4">
      {session?.user ? (
        <>
          <h1 className=" text-lg md:text-2xl  text-primary font-black">
            {isArabic ? "مرحبا بك في لوحة التحكم  " : "Welcome to  dashboard"}
          </h1>
          <h1 className=" text-lg md:text-2xl font-bold text-accent-foreground">
            {" "}
            {session.user.email}
          </h1>

          {session.user.role === "ADMIN" && (
            <>
              <div className="flex flex-col justify-center items-center gap-4">
                <h1 className="text-green-600 text-lg md:text-2xl font-semibold">
                  {isArabic ? "أنت مدير" : "You are a manager"}
                </h1>

                <Link
                  href="/dashboard/projectDashboard"
                  className="cursor-pointer"
                >
                  <Button className="cursor-pointer w-[145px] rounded-none">
                    {isArabic ? "لوحة التحكم الخاصة " : "Dashboard"}
                  </Button>
                </Link>
              </div>
            </>
          )}
          <Link href="/dashboard/tasks" className="cursor-pointer">
            <Button className="cursor-pointer w-[145px] rounded-none">
              {isArabic ? "لوحة المهمات" : "Tasks"}
            </Button>
          </Link>
          <LogoutButton params={locale} />
        </>
      ) : (
        <>
          <h1>{isArabic ? " لم تسجل دخول" : "You are not logged in"}</h1>
          <Link className="cursor-pointer" href="/login">
            <Button className="cursor-pointer">
              {isArabic ? "تسجيل الدخول" : "Login"}
            </Button>
          </Link>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
