"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface VisitorTrackerProps {
  locale: string;
}

export default function VisitorTracker({ locale }: VisitorTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Extract project ID if on a project detail page
    const projectIdMatch = pathname?.match(/\/projects\/([^\/]+)/);
    const projectId = projectIdMatch ? projectIdMatch[1] : null;

    // Get referrer from document
    const referrer = typeof document !== "undefined" ? document.referrer || null : null;

    // Track the visit (non-blocking, fire-and-forget)
    const trackVisit = () => {
      // Use sendBeacon for better performance and reliability
      if (navigator.sendBeacon) {
        const data = JSON.stringify({
          path: pathname || "/",
          locale: locale || "en",
          projectId: projectId,
          referrer: referrer,
        });
        navigator.sendBeacon("/api/analytics/visit", data);
      } else {
        // Fallback to fetch with keepalive
        fetch("/api/analytics/visit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname || "/",
            locale: locale || "en",
            projectId: projectId,
            referrer: referrer,
          }),
          keepalive: true,
        }).catch(() => {
          // Silently fail - don't break the user experience
        });
      }
    };

    // Track on mount and route changes (non-blocking)
    trackVisit();
  }, [pathname, locale]);

  return null; // This component doesn't render anything
}

