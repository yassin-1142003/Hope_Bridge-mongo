"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

const tipsEN = [
  " Every act of kindness creates ripples of hope.",
  " When we give, the world grows brighter.",
  " Together, we can lift hearts and change lives.",
  " Giving is not about how much, but how deeply you care.",
  "A small act of love can heal a soul.",
  " Compassion is the heartbeat of humanity.",
  " One light can spark a thousand others.",
  " Kindness needs no reason — just a willing heart.",
  " True wealth is found in sharing, not keeping.",
  " A helping hand can rewrite someone's story.",
  " Hope shines strongest in dark times.",
  " Giving turns compassion into action.",
  " Small acts create great change.",
  " Love multiplies when you give it away.",
  " Generosity is a language all hearts understand.",
  " Be the reason someone believes in goodness again.",
  " What you give lives forever in the hearts of others.",
  " Kindness flows endlessly when shared.",
  " The gift of giving blesses both hearts — yours and theirs.",
  " When we lift others, we rise together.",
];

const tipsAR = [
  " كل عمل لطف يصنع موجات من الأمل.",
  " عندما نعطي، يزداد العالم نورًا.",
  " معًا يمكننا أن نرفع القلوب ونغير الحياة.",
  " العطاء لا يقاس بالكثرة بل بصدق النية.",
  " لمسة حب صغيرة قد تشفي روحًا متعبة.",
  " الرحمة هي نبض الإنسانية.",
  " نور واحد يمكنه إشعال ألف نور.",
  " اللطف لا يحتاج سببًا، فقط قلبًا طيبًا.",
  " الغنى الحقيقي هو في المشاركة لا في التملك.",
  " يد العون قد تعيد الأمل لحياة كاملة.",
  " الأمل يسطع أكثر في أوقات الظلام.",
  " العطاء يحول الرحمة إلى فعل.",
  " الأفعال الصغيرة تصنع التغيير الكبير.",
  " الحب يتضاعف عندما نعطيه.",
  " الكرم لغة يفهمها كل قلب.",
  " كن السبب في إيمان أحدهم بالخير من جديد.",
  " ما تعطيه يعيش في قلوب الآخرين إلى الأبد.",
  " اللطف يتدفق بلا نهاية عندما يُشارك.",
  " هدية العطاء تبارك المعطي والمتلقي.",
  " عندما نرفع الآخرين، نرتقي جميعًا.",
];

const FloatingParticles = () => {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    duration: 4 + Math.random() * 3,
    x: Math.random() * 100,
    size: 15 + Math.random() * 12,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            background: `radial-gradient(circle, rgba(34,197,94,0.3), rgba(20,184,166,0.2))`,
            boxShadow: "0 0 20px rgba(34,197,94,0.2)",
          }}
          initial={{ y: "100vh", opacity: 0 }}
          animate={{ y: "-20vh", opacity: [0, 0.8, 0.8, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default function LoadingScreen() {
  const locale = useLocale();
  const [tip, setTip] = useState("");
  const isArabic = locale.startsWith("ar");

  useEffect(() => {
    const list = isArabic ? tipsAR : tipsEN;
    setTip(list[Math.floor(Math.random() * list.length)]);
  }, [isArabic]);

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full bg-gradient-to-br from-background via-background to-green-50/20 dark:from-[#1d1616] dark:via-[#1d1616] dark:to-green-950/10 text-accent-foreground dark:text-gray-200 font-sans overflow-hidden">
      <FloatingParticles />

      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-green-400/5 via-transparent to-transparent pointer-events-none" />

      {/* Logo with enhanced animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          duration: 1.2,
          ease: [0.34, 1.56, 0.64, 1],
          type: "spring",
        }}
        className="relative z-10"
      >
        <div className="bg-background dark:bg-[#1d1616] rounded-full p-4">
          <Image
            src="/logo.webp"
            alt="Logo"
            width={120}
            height={120}
            className="rounded-full"
          />
        </div>
      </motion.div>

      {/* Title with modern animation */}
      <motion.h1
        className="mt-8 text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {isArabic ? "نبني جسور الأمل" : "Building Bridges of Hope"}
      </motion.h1>

      {/* Tip text with modern styling */}
      <motion.div
        dir={isArabic ? "rtl" : "ltr"}
        className="mt-6 text-base md:text-lg  text-center max-w-md px-8 z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <p
          className={`${isArabic ? "text-right" : "text-left"} leading-relaxed text-foreground/80 dark:text-gray-300`}
        >
          {tip}
        </p>
      </motion.div>

      {/* Modern animated progress indicator */}
      <div className="mt-10 flex gap-2 z-10">
        {[0, 1, 2, 3].map((i) => (
          <motion.div key={i} className="relative">
            <motion.span
              className="block w-2.5 h-2.5 rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 shadow-lg"
              initial={{ scale: 0.7, opacity: 0.3 }}
              animate={{
                scale: [0.7, 1.4, 0.7],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
            <motion.span
              className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-400"
              animate={{
                scale: [1, 2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Curtains with original colors */}
      <motion.div
        className="absolute z-50 top-0 left-0 w-1/2 h-full bg-[#f3d7bd] shadow-2xl"
        initial={{ x: 0 }}
        animate={{ x: "-100%", transitionEnd: { display: "none" } }}
        transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1], delay: 0.3 }}
      />
      <motion.div
        className="absolute z-50 top-0 right-0 w-1/2 h-full bg-[#c7d8b7] shadow-2xl"
        initial={{ x: 0 }}
        animate={{ x: "100%", transitionEnd: { display: "none" } }}
        transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1], delay: 0.3 }}
      />
    </div>
  );
}
