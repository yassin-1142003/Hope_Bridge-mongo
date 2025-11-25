"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configure like YouTube
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.1,
});

export default function ProgressBar() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;

    NProgress.start();

    const timer = setTimeout(() => {
      NProgress.done();
    }, 300); // waits a bit for data/render

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!pathname) return;

    // Start progress on route change
    NProgress.start();

    // Finish progress once React commits the new route
    // (useLayoutEffect could be even more accurate, but useEffect works fine)
    NProgress.done();
  }, [pathname]);

  return null;
}
