"use client";

import "./globals.css";
import { Home, Compass } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // 👈 detect current URL
import Script from "next/script";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const pathname = usePathname();

  // Detect if Arabic locale is active
  const isArabic = pathname?.startsWith("/ar");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Track 404 visits
  useEffect(() => {
    const track404 = async () => {
      try {
        await fetch("/api/analytics/visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: pathname || "/404",
            locale: isArabic ? "ar" : "en",
          }),
        });
      } catch (error) {
        console.debug("404 tracking failed:", error);
      }
    };
    track404();
  }, [pathname, isArabic]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center h-[100svh] overflow-hidden 
      bg-[linear-gradient(135deg,#1a1a1a,#2a2a2a)] text-white ${
        isArabic ? "font-[Cairo] rtl" : "font-sans ltr"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Glowing orb */}
      <div
        className="absolute top-[-12rem] left-[-12rem] w-[24rem] h-[24rem] rounded-full blur-[80px] bg-[#d23e3e]/20 animate-pulse"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />

      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[#d23e3e]/30 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${5 + Math.random() * 10}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      <Script
        src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.5/dist/dotlottie-wc.js"
        type="module"
      />
      <DotLottieReact
        src="https://lottie.host/8992a988-dd4d-414c-a13c-c00e979fb972/PtPeLr4el2.lottie"
        // src="https://lottie.host/cbbc6f77-7409-4b20-b6f5-b06c18839a2b/ClB6hMSmDv.lottie"
        loop
        autoplay
        style={{ width: "300px", height: "300px" }}
      />
      {/* <dotlottie-wc style="width: 300px;height: 300px" autoplay loop /> */}
      {/* Content */}
      <div className="relative z-10 text-center max-w-[900px] px-4">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          {isArabic ? "عذرًا! الصفحة غير موجودة" : "Oops! Page Not Found"}
        </h2>

        <p className="text-base md:text-lg text-white/70 mb-12 max-w-[600px] mx-auto leading-relaxed">
          {isArabic
            ? "الصفحة التي تبحث عنها غير موجودة أو تم نقلها. لنعدك إلى المسار الصحيح!"
            : "The page you’re looking for doesn’t exist or has been moved. Let’s get you back on track!"}
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link
            href={isArabic ? "/ar" : "/"}
            className="flex items-center gap-2 px-6 py-3 bg-[#d23e3e] hover:bg-[#b93434] rounded-xl text-white font-semibold text-lg transition-all shadow-lg hover:scale-105"
          >
            <Home size={20} />
            {isArabic ? "العودة إلى الرئيسية" : "Back to Home"}
          </Link>

          <Link
            href={isArabic ? "/ar/projects" : "/projects"}
            className="flex items-center gap-2 px-6 py-3 border-2 border-[#d23e3e]/60 hover:border-[#d23e3e] rounded-xl text-white/90 hover:text-white font-semibold text-lg transition-all hover:bg-[#d23e3e]/10 hover:scale-105"
          >
            <Compass size={20} />
            {isArabic ? "استكشاف المشاريع" : "Explore Projects"}
          </Link>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          {[
            {
              href: isArabic ? "/ar/about" : "/about",
              text: isArabic ? "من نحن" : "About Us",
            },
            {
              href: isArabic ? "/ar/contact" : "/contact",
              text: isArabic ? "اتصل بنا" : "Contact",
            },
          ].map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
            >
              <span className="w-1 h-1 bg-[#d23e3e] rounded-full" />
              {link.text}
            </Link>
          ))}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-100px) translateX(50px);
            opacity: 1;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .rtl {
          direction: rtl;
          text-align: right;
        }
        .ltr {
          direction: ltr;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
