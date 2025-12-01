"use client";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Image from "next/image";
import { useParams } from "next/navigation";
import { messages } from "./messages";
import {
  Award,
  CheckCircle,
  Heart,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

export default function DonatePage() {
  const campaignId = "donate-823324";

  const { locale } = useParams();
  const [count, setCount] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const t = messages[locale as "en" | "ar"] || messages.en;
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowIframe(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("donate-section");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  // const [scrollY, setScrollY] = useState(0);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     setScrollY(window.scrollY);
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  useEffect(() => {
    if (isInView && count < 42) {
      const timer = setTimeout(() => setCount(count + 1), 30);
      return () => clearTimeout(timer);
    }
  }, [isInView, count]);
  // const formHeight = 1000; // Your iframe height
  // const maxScroll = 600; // How much scrolling to fully reveal
  // const initialOffset = formHeight / 2; // Start with half the form below viewport center (300px)
  // const translateY = Math.max(
  //   initialOffset - (scrollY / maxScroll) * initialOffset,
  //   0
  // );

  const donors = [
    {
      name: "Ahmed Mahmoud",
      amount: "$50",
      message: "Keep inspiring hope ❤️",
      badge: "bronze",
    },
    {
      name: "Sarah Ali",
      amount: "$100",
      message: "For Gaza families 🕊️",
      badge: "silver",
    },
    {
      name: "Mohamed Essam",
      amount: "$25",
      message: "Every bit counts!",
      badge: "bronze",
    },
    { name: "Layla Khaled", amount: "$75", message: "", badge: "silver" },
    {
      name: "Hassan Tamer",
      amount: "$30",
      message: "Stay strong 💪",
      badge: "bronze",
    },
    {
      name: "Nour Said",
      amount: "$20",
      message: "Peace and love 🌸",
      badge: "bronze",
    },
    {
      name: "Omar Abdelaziz",
      amount: "$120",
      message: "Together we rise 🙏",
      badge: "gold",
    },
    { name: "Heba Raffet", amount: "$60", message: "", badge: "silver" },
  ];

  const donorsRef = useRef(null);
  const isDonorsInView = useInView(donorsRef, { once: true, amount: 0.2 });

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "gold":
        return "from-yellow-400 to-yellow-600";
      case "silver":
        return "from-gray-300 to-gray-500";
      default:
        return "from-orange-400 to-orange-600";
    }
  };

  return (
    <main
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="-mt-28 text-accent-foreground bg-background dark:text-white overflow-hidden"
    >
      {/* <motion.div
        dir={locale === "ar" ? "rtl" : "ltr"}
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        animate={{ y: translateY }}
        transition={{
          opacity: { delay: 0.2, duration: 0.8 },
          x: { delay: 0.2, duration: 0.8 },
          y: { duration: 0.3, ease: "easeInOut" },
        }}
        className={`fixed hidden scrollbar-hide lg:block z-50 max-h-[600px] w-fit rounded-3xl 
    overflow-hidden 
    ${locale === "ar" ? "-left-5" : "-right-5"}`} // ✅ Position depends on language
      >
        <Script src="https://donorbox.org/widget.js" strategy="lazyOnload" />

        <motion.div className="overflow-y-scroll max-h-[600px]">
          <motion.iframe
            key={iframeLoaded ? "iframe" : "skeleton"}
            onLoad={() => setIframeLoaded(true)}
            src={`https://donorbox.org/embed/${campaignId}?`}
            name="donorbox"
            allowFullScreen
            seamless
            scrolling="yes"
            className={`border-0 w-full scrollbar-hide rounded-3xl transition-opacity duration-500 ${
              iframeLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{
              minWidth: "400px",
              height: "600px",
            }}
            allow="payment"
          />
        </motion.div>
      </motion.div> */}

      {/* --- Enhanced Hero Section --- */}
      <section className="relative mt-27 min-h-[85svh] flex items-center justify-center overflow-hidden bg-linear-to-br from-[#d23e3e] via-[#b83232] to-[#a02828]">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Floating Hearts */}
        <div className="absolute inset-0 overflow-hidden"></div>
        <div className="absolute inset-0 w-full h-full">
          {[...Array(15)].map((_, i) => {
            const startX = Math.random() * 100;
            const endX = startX + (Math.random() - 0.5) * 20;
            const size = 20 + Math.random() * 25;
            const duration = 15 + Math.random() * 10;
            const delay = Math.random() * 5;

            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${startX}%`,
                  top: "-50px", // Changed from bottom to top
                }}
                animate={{
                  y: [0, window.innerHeight + 100], // Changed to positive value (moving down)
                  x: [`0%`, `${endX - startX}%`],
                  opacity: [0, 0.4, 0.6, 0.4, 0],
                  rotate: [0, 180 + Math.random() * 180],
                  scale: [0.8, 1, 1.1, 1, 0.9],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  delay,
                  ease: "linear",
                }}
              >
                <Heart
                  className="text-white/80 fill-white/40"
                  size={size}
                  strokeWidth={1.5}
                />
              </motion.div>
            );
          })}
        </div>
        {/* Radial Glow */}
        <div className="absolute inset-0 bg-linear-radial from-white/10 via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center px-6 max-w-5xl"
        >
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">
              Make an Impact Today
            </span>
          </motion.div>

          {/* Animated Title */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {t.heroTitle.split(" ").map((word, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
              >
                {word}{" "}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="text-xl md:text-2xl font-light leading-relaxed max-w-3xl mx-auto mb-10 text-white/95"
          >
            {t.heroParagraph1}
          </motion.p>

          {/* Enhanced CTA Button */}
          <motion.a
            href="#donate-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 bg-white text-[#d23e3e] px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300"
          >
            <Heart className="w-5 h-5" />
            Donate Now
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.a>

          {/* Decorative Line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="h-1 bg-white/50 mx-auto rounded-full mt-12"
          />
        </motion.div>
      </section>

      {/* --- Enhanced Donation Section --- */}
      <section
        id="donate-section"
        className="relative w-full py-24 px-6 md:px-12"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-red-100 dark:bg-red-900/10 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div
            className="absolute bottom-20 left-10 w-96 h-96 bg-red-50 dark:bg-red-900/5 rounded-full blur-3xl opacity-40 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>
        <div className="relative  flex justify-between   flex-col lg:flex-row gap-16 items-start">
          {/* Left Content - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="flex-1 space-y-8"
          >
            {/* Title with Icon */}
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="p-3 bg-linear-to-br from-red-500 to-primary rounded-2xl shadow-lg"
              >
                <Heart className="w-8 h-8 text-white fill-white" />
              </motion.div>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                {t.donationTitle}
              </h2>
            </div>

            {/* Description */}
            <div className="space-y-5 bg-linear-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.donationParagraph1}
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.donationParagraph2}
              </p>
            </div>

            {/* Enhanced Progress Section */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t.raised}
                  </span>
                </div>
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  viewport={{ once: true }}
                  className="text-2xl font-extrabold text-primary"
                >
                  42%
                </motion.span>
              </div>

              <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "42%" }}
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="absolute h-full bg-linear-to-r from-primary via-red-600 to-primary rounded-full shadow-lg"
                />
                <motion.div
                  animate={{ x: [-20, 300] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute h-full w-20 bg-linear-to-r from-transparent via-white/30 to-transparent"
                />
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{donors.length} Donors</span>
                </div>
                <span>•</span>
                <span>Goal: $10,000</span>
              </div>
            </div>

            {/* Trust indicators - Enhanced */}
            <div className="flex flex-wrap items-center gap-4">
              {[
                {
                  icon: CheckCircle,
                  text: "Secure Payment",
                  color: "text-green-500",
                },
                {
                  icon: Shield,
                  text: "Tax Deductible",
                  color: "text-blue-500",
                },
                {
                  icon: Award,
                  text: "Verified Charity",
                  color: "text-purple-500",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-full shadow-md border border-gray-200 dark:border-gray-700"
                >
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right DonorBox Form - Enhanced */}
          {/* <div className="flex justify-center items-start w-full max-w-lg"></div> */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex justify-center items-start w-full max-w-lg relative"
          >
            {!iframeLoaded && (
              <div className="absolute  inset-0 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                {" "}
                <div className="space-y-6">
                  {" "}
                  {/* Header skeleton */}{" "}
                  <div className="space-y-3">
                    {" "}
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />{" "}
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />{" "}
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />{" "}
                  </div>{" "}
                  {/* Amount buttons skeleton */}{" "}
                  <div className="grid grid-cols-3 gap-3">
                    {" "}
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"
                      />
                    ))}{" "}
                  </div>{" "}
                  {/* Custom amount skeleton */}{" "}
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />{" "}
                  {/* Form fields skeleton */}{" "}
                  <div className="space-y-4">
                    {" "}
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />{" "}
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />{" "}
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />{" "}
                  </div>{" "}
                  {/* Button skeleton */}{" "}
                  <div className="h-14 bg-linear-to-r from-primary to-red-600 opacity-50 rounded-lg" />{" "}
                  {/* Loading text */}{" "}
                  <div className="flex items-center justify-center gap-2 pt-4">
                    {" "}
                    <div className="w-5 h-5 border-3 border-primary border-t-transparent rounded-full animate-spin" />{" "}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {" "}
                      Loading donation form...{" "}
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            )}

            {showIframe && (
              <>
                <Script
                  src="https://donorbox.org/widget.js"
                  strategy="lazyOnload"
                />
                <iframe
                  onLoad={() => setIframeLoaded(true)}
                  src={`https://donorbox.org/embed/${campaignId}?`}
                  name="donorbox"
                  allowFullScreen
                  seamless
                  scrolling="no"
                  className={`border-0 rounded-3xl transition-opacity duration-500 ${
                    iframeLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    minWidth: "350px",
                    height: "600px",
                  }}
                  allow="payment"
                />
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* --- Enhanced Where Donations Go --- */}
      <section className="relative py-24 text-center px-6 overflow-hidden bg-linear-to-b from-background to-gray-50 dark:to-gray-900/50">
        {/* Floating Icons */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-primary opacity-10"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 3) * 25}%`,
              fontSize: "2.5rem",
            }}
            animate={{
              y: [0, -25, 0],
              rotate: [0, 15, 0],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {i % 3 === 0 ? "❤️" : i % 3 === 1 ? "🌟" : "🤲"}
          </motion.div>
        ))}

        {/* Enhanced Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative z-10 mb-20"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            viewport={{ once: true }}
            className="inline-block mb-6 p-4 bg-linear-to-br from-[#d84040] to-primary rounded-2xl shadow-xl"
          >
            <Sparkles className="w-14 h-14 text-white" />
          </motion.div>

          <h3 className="text-4xl md:text-5xl lg:text-6xl p-2 font-extrabold bg-linear-to-r from-primary via-primary to-primary bg-clip-text text-transparent mb-6">
            {t.sectionTitle}
          </h3>

          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 150 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            viewport={{ once: true }}
            className="h-1.5 bg-linear-to-r from-[#d84040] to-primary mx-auto rounded-full shadow-lg"
          />
        </motion.div>

        {/* Enhanced Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10">
          {t.donationSections.map((item, i) => (
            <motion.div
              dir={locale === "ar" ? "rtl" : "ltr"}
              key={i}
              className="group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              {/* Image Container */}
              <div className="relative w-full h-64 overflow-hidden">
                <Image
                  fill
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover  transition-transform duration-700"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

                {/* Animated Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-40"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.8 }}
                />

                {/* Floating Icon */}
                <motion.div
                  whileHover={{ scale: 1.3, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="absolute bottom-4 right-4 bg-white/95 dark:bg-gray-800/95 p-4 rounded-2xl shadow-2xl backdrop-blur-sm"
                >
                  <Heart className="w-7 h-7 text-[#d84040] fill-[#d84040]" />
                </motion.div>
              </div>

              {/* Content */}
              <div dir={locale === "ar" ? "rtl" : "ltr"} className="p-7">
                <h4 className="text-2xl font-bold text-[#d84040] dark:text-[#ff6b6b] mb-4 group-hover:text-[#ff6b6b] transition-colors">
                  {item.title}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                  {item.desc}
                </p>
              </div>

              {/* Corner Decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-[#d84040]/30 to-transparent rounded-bl-full" />

              {/* Bottom Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#d84040] via-[#ff6b6b] to-[#d84040] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- Enhanced Donors Section --- */}
      <section
        ref={donorsRef}
        className="relative py-24 border-t-2 border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto text-center px-6 relative z-10">
          {/* Enhanced Title Section */}
          <motion.div viewport={{ once: true }} className="mb-20">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6 p-5 bg-linear-to-br from-[#d84040] to-primary rounded-3xl shadow-2xl"
            >
              <Award className="w-16 h-16 text-white" />
            </motion.div>

            <h2 className="text-5xl md:text-6xl p-5 font-black mb-6 bg-linear-to-r from-primary to-[#d84040] bg-clip-text text-transparent">
              {t.donorsTitle}
            </h2>

            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              viewport={{ once: true }}
              className="mt-8 inline-flex items-center gap-3 bg-linear-to-r from-[#d84040]/10 to-[#ff6b6b]/10 dark:from-[#d84040]/20 dark:to-[#ff6b6b]/20 px-8 py-4 rounded-full border-2 border-[#d84040]/20 shadow-lg"
            >
              <Star className="w-6 h-6 text-[#d84040] fill-[#d84040]" />
              <span className="text-[#d84040] dark:text-[#ff6b6b] font-bold text-lg">
                {t.donorsNote}
              </span>
            </motion.div>
          </motion.div>

          {/* Simplified Donor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
            {donors.map((donor, i) => (
              <motion.div
                key={i}
                dir={locale === "ar" ? "rtl" : "ltr"}
                className="relative flex items-center gap-4 
          bg-white dark:bg-gray-900
          p-5 rounded-xl border border-gray-200 dark:border-gray-700 
          shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-14 h-14 rounded-full bg-linear-to-br ${getBadgeColor(
                      donor.badge
                    )} flex items-center justify-center text-white text-xl font-bold shadow-md`}
                  >
                    {donor.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-900 rounded-full p-1">
                    <Heart className="w-3 h-3 text-[#d84040] fill-[#d84040]" />
                  </div>
                </div>

                {/* Info */}
                <div
                  className={`flex-1 ${locale === "ar" ? "text-right" : "text-left"}`}
                >
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {donor.name}
                  </p>
                  {donor.message && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                      {donor.message}
                    </p>
                  )}
                </div>

                {/* Amount Badge */}
                <div className="flex-shrink-0">
                  <div
                    className={`bg-linear-to-br ${getBadgeColor(
                      donor.badge
                    )} text-white font-bold text-sm px-4 py-2 rounded-full shadow-md`}
                  >
                    {donor.amount}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Note */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-linear-to-br from-[#d84040]/5 via-[#d84040]/10 to-[#ff6b6b]/5 dark:from-[#d84040]/10 dark:via-[#d84040]/20 dark:to-[#ff6b6b]/10 rounded-3xl p-10 border-2 border-[#d84040]/20 shadow-xl"
          >
            <p
              className={`text-gray-700 dark:text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed mb-8 ${
                locale === "ar" ? "text-right" : "text-left"
              }`}
            >
              {t.donorsNote}
            </p>

            {/* Security Badges */}
            <div className="flex flex-wrap justify-center gap-6">
              {[
                {
                  icon: Shield,
                  text:
                    locale === "ar"
                      ? "مدفوعات آمنة عبر DonorBox"
                      : "Secure Payments via DonorBox",
                  color: "text-green-600",
                },
                {
                  icon: CheckCircle,
                  text:
                    locale === "ar"
                      ? "100٪ تذهب للمساعدات الموثقة"
                      : "100% Goes to Verified Aid",
                  color: "text-[#d84040]",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg border-2 border-gray-200 dark:border-gray-700"
                >
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
/* <section className="relative flex flex-col items-center justify-center text-center h-[750px]  overflow-hidden bg-linear-to-br from-[#d84040] via-[#e05555] to-[#d84040] text-white ">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -100],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute text-white opacity-20"
            style={{
              left: `${15 + i * 20}%`,
              top: `${20 + i * 15}%`,
              fontSize: "2rem",
            }}
            animate={{
              rotate: 360,
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            ✦
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl px-6"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t.heroTitle.split(" ").map((word, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              >
                {word}{" "}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-8"
          >
            {t.heroParagraph1}
          </motion.p>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="h-1 bg-white mx-auto rounded-full mb-10"
          />
        </motion.div>

        <motion.svg
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-0 left-0 w-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <motion.path
            fill="#ed8348"
            fillOpacity="1"
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            animate={{
              d: [
                "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,213.3C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.svg>
      </section> */

/* <section className="relative flex flex-col items-center justify-center text-center h-[650px] overflow-hidden bg-linear-to-br from-[#5a1a1a] via-[#b93e3e] to-[#e96b4c] text-white">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ y: [-20, -100], opacity: [0, 1, 0] }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl px-6"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t.heroTitle.split(" ").map((word, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              >
                {word}{" "}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-8"
          >
            {t.heroParagraph1}
          </motion.p>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="h-1 bg-white mx-auto rounded-full mb-10"
          />
        </motion.div>
      </section> */

/* <section className="relative flex flex-col  items-center justify-center text-center h-[600px] overflow-hidden bg-linear-to-b from-primary to-primary/80 text-white ">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${10 + Math.random() * 20}px`,
                height: `${10 + Math.random() * 20}px`,
              }}
              animate={{
                y: [-50, -150],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-3xl px-4"
        >
          <motion.h1
            className="text-4xl md:text-6xl font-sans font-bold mb-6 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {t.heroTitle.split(" ").map((word, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
              >
                {word}{" "}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-base md:text-lg font-light max-w-xl mx-auto mb-6"
          >
            {t.heroParagraph1}
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 1, duration: 0.7 }}
            className="h-0.5 bg-white/80 mx-auto rounded-full mb-8"
          />
        </motion.div>

        <motion.svg
          className="absolute bottom-0 left-0 w-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
        >
          <motion.path
            fill="#fff"
            fillOpacity="0.9"
            d="M0,160L60,150C120,140,240,120,360,130C480,140,600,170,720,160C840,150,960,110,1080,100C1200,90,1320,110,1380,120L1440,130L1440,200H0Z"
          />
        </motion.svg>
      </section> */

/* <section
        key="geometric"
        className="relative flex flex-col items-center justify-center text-center overflow-hidden bg-linear-to-br from-[#d84040] via-[#e05555] to-[#d84040] text-white min-h-screen"
      >
        <div className="absolute inset-0 opacity-10">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute border-2 border-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${50 + Math.random() * 100}px`,
                height: `${50 + Math.random() * 100}px`,
              }}
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`hex-${i}`}
              className="absolute"
              style={{
                left: `${10 + i * 12}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
              }}
            >
              <svg
                width="60"
                height="60"
                viewBox="0 0 60 60"
                className="text-white opacity-20"
              >
                <polygon
                  points="30,5 50,17.5 50,42.5 30,55 10,42.5 10,17.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl px-6"
        >
          <motion.h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
            {t.heroTitle.split(" ").map((word, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, rotateX: 90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
              >
                {word}{" "}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto"
          >
            {t.heroParagraph1}
          </motion.p>
        </motion.div>

        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <motion.path
            fill="#ed8348"
            d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,165.3C672,160,768,96,864,90.7C960,85,1056,139,1152,149.3C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z"
            animate={{
              d: [
                "M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,165.3C672,160,768,96,864,90.7C960,85,1056,139,1152,149.3C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z",
                "M0,192L48,197.3C96,203,192,213,288,197.3C384,181,480,139,576,133.3C672,128,768,160,864,181.3C960,203,1056,213,1152,202.7C1248,192,1344,160,1392,144L1440,128L1440,320L0,320Z",
              ],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </svg>
      </section> */

/* <section className="relative h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-[#d23e3e] via-[#e05555] to-[#c93535]">
        <div className="absolute inset-0 bg-black/5"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center px-6 max-w-4xl"
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-6xl md:text-7xl font-light text-white mb-6"
          >
            {t.heroTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl md:text-2xl text-white/90 font-light mb-12 max-w-2xl mx-auto"
          >
            {t.heroParagraph1}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          ></motion.div>
        </motion.div>
      </section> */
