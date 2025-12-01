"use client";

import { useEffect } from "react";
import lottie, { AnimationItem } from "lottie-web";
import NOinternet from "@/public/NOinternet.json";
import { useLocale } from "next-intl";

export default function OfflinePage() {
  const locale = useLocale();
  const isArabic = locale === "ar";
  useEffect(() => {
    const container = document.getElementById("lottie");
    let animation: AnimationItem | null = null;

    if (container) {
      // ✅ Destroy previous animations before creating a new one
      lottie.destroy();
      animation = lottie.loadAnimation({
        container,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: NOinternet,
      });
    }

    // Auto-reload when online
    const checkOnline = () => {
      if (navigator.onLine) window.location.reload();
    };
    const interval = setInterval(checkOnline, 2000);

    return () => {
      clearInterval(interval);
      if (animation) animation.destroy(); // ✅ clean up animation
    };
  }, []);

  return (
    <main className="min-h-[100svh] flex flex-col items-center justify-center text-center p-6 bg-linear-to-br from-[#1a1a1a] to-[#2a2a2a] text-white animate-fade-in">
      <div id="lottie" className="w-[300px] h-[300px]" />

      <h2 className="text-2xl font-semibold mt-6">
        {" "}
        {isArabic ? "انت غير متصل" : "You’re Offline"}{" "}
      </h2>
      <p className="text-base opacity-80 mt-2">
        {isArabic
          ? " من فضلك تفقد الانترنت الخاص بك , وحاول مرة اخرى "
          : "Please check your internet connection and try again."}
      </p>

      {/* <button
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-3 rounded-lg bg-red-600 hover:bg-amber-400 text-white font-medium transition-colors"
      >
        Try Again
      </button> */}
    </main>
  );
}
