"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { PageProps } from "@/types/next";

// eslint-disable-next-line @next/next/no-async-client-component
export default async function ThankYouPage({
  params,
}: PageProps<{ locale: string }>) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="h-[70svh] flex flex-col items-center justify-start  text-center p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-lg w-full bg-white/80 dark:bg-gray-900/70 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-primary/10"
      >
        {/* Animated Icons */}
        <div className="flex justify-center items-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <CheckCircle2 className="w-14 h-14 text-primary" />
          </motion.div>
        </div>

        <h1 className="text-3xl font-bold text-primary mb-4">
          {isArabic ? "شكرًا لتبرعك!" : "Thank You for Your Donation!"}
        </h1>

        <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
          {isArabic
            ? "بفضلك سنتمكن من مساعدة المزيد من المحتاجين ❤️"
            : "Your generosity helps us reach more people in need ❤️"}
        </p>

        <motion.a
          href={`/${locale}`}
          whileHover={{ scale: 1.05 }}
          className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-full font-medium transition"
        >
          {isArabic ? "العودة إلى الصفحة الرئيسية" : "Back to Home"}
        </motion.a>
      </motion.div>
    </div>
  );
}
