"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Script from "next/script";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale?: string;
}

export default function DonationModal({
  isOpen,
  onClose,
  locale,
}: DonationModalProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const campaignId = "donate-823324";
  const isArabic = locale === "ar";

  // prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex flex-col md:flex-row w-full sm:w-[90%] md:w-[85%] lg:w-[75%] xl:w-[70%] bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]"
        >
          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-red-500 bg-white/70 dark:bg-black/70 rounded-full p-1 z-10 shadow-sm"
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* LEFT SIDE — image + text */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex flex-col justify-center items-center w-full md:w-[50%] text-white p-8 md:p-10 relative"
            style={{
              backgroundImage: "url('/aboutus/side4.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 text-center max-w-sm px-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 drop-shadow-lg">
                {isArabic ? "❤️ دعم الانسانية  " : "Supporting Humanity ❤️"}
              </h2>
              <p className="text-gray-200 text-base md:text-lg leading-relaxed">
                {isArabic
                  ? "كل تبرع يساعد في توفير طعام، تعليم و ملجأ للناس المحتاجين"
                  : "Every donation helps provide food, education, and shelter for those in need. Your generosity changes lives"}
              </p>
            </div>
          </motion.div>

          {/* RIGHT SIDE — iframe + skeleton */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="flex-1 flex justify-center p-6 md:p-10 bg-gray-50 dark:bg-[#111] overflow-y-auto"
          >
            <Script
              src="https://donorbox.org/widget.js"
              strategy="lazyOnload"
            />
            <motion.div className="relative w-full  max-w-[650px]">
              {/* Skeleton Loader */}
              {!iframeLoaded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full  rounded-lg bg-white dark:bg-[#1b1b1b] shadow-inner p-6 space-y-5 animate-pulse"
                >
                  <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="space-y-3 pt-4">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="pt-4">
                    <div className="h-12 w-full bg-gray-300 dark:bg-gray-600 rounded-md" />
                  </div>
                  <div className="pt-6 space-y-2">
                    <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </motion.div>
              )}

              {/* Donorbox iframe */}
              <motion.iframe
                key={iframeLoaded ? "iframe" : "skeleton"}
                onLoad={() => setIframeLoaded(true)}
                src={`https://donorbox.org/embed/${campaignId}?`}
                name="donorbox"
                allowFullScreen
                seamless
                scrolling="no"
                className={`w-full max-w-[650px] border-0 flex justify-center items-center transition-opacity duration-500 ${
                  iframeLoaded ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  minWidth: "300px",
                  height: "1000px", // more room for full forms
                }}
                allow="payment"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
