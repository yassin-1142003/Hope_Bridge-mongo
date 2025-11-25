"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import LoadingScreen from "@/components/LoadingScreen";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Splash screen timeout
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Progress bar on route change
  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => {
      NProgress.done();
    }, 500); // fake delay for smooth effect

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return <>{loading ? <LoadingScreen /> : children}</>;
}
