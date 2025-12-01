import React from "react";
import * as motion from "motion/react-client";
import {
  Heart,
  Users,
  Target,
  Award,
  BriefcaseMedical,
  HandHeart,
  Lightbulb,
  Sparkles,
  Zap,
  Leaf,
  GraduationCap,
  HeartPulse,
  Brain,
  LucideIcon,
  Linkedin,
  Instagram,
  Facebook,
} from "lucide-react";
import Image from "next/image";
import type { PageProps } from "@/types/next";
import { getTranslations } from "next-intl/server";

// Define a type for the values to make the code cleaner
interface Value {
  key: string;
  icon: LucideIcon;
}

const VALUES: Value[] = [
  { key: "integrity", icon: HandHeart },
  { key: "collaboration", icon: Users },
  { key: "impact", icon: Sparkles },
  { key: "innovation", icon: Lightbulb },
];

const WORK_AREAS: Value[] = [
  { key: "humanitarian", icon: HandHeart },
  { key: "health", icon: HeartPulse },
  { key: "education", icon: GraduationCap },
  { key: "livelihood", icon: BriefcaseMedical },
  { key: "psychosocial", icon: Brain },
];

const WHY_CHOOSE_US_ITEMS: Value[] = [
  { key: "trusted", icon: Award },
  { key: "efficiency", icon: Zap },
  { key: "effectiveness", icon: Leaf },
  { key: "community", icon: Users },
];

const AboutUsPage = async ({
  params,
}: PageProps<{ id: string; locale: string }>) => {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const t = await getTranslations({ locale, namespace: "about" });

  return (
    <div className="min-h-screen w-full" dir={isArabic ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <section className="relative h-screen  flex items-center justify-center text-center text-background overflow-hidden w-full">
        <Image
          src={`/aboutus/hero.webp`}
          alt="Hero Background"
          fill
          className="absolute inset-0 z-0 object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/70 z-10" />
        <motion.div
          className="relative z-20 max-w-4xl px-4 w-full"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-5xl text-[#f5f5f5] md:text-7xl font-extrabold mb-6 drop-shadow-lg">
            {t("hero.title")}
          </h1>
          <p className="text-lg text-[#f5f5f5] md:text-2xl mb-8 font-medium drop-shadow-md">
            {t("hero.subtitle")}
          </p>
          <button className="px-8 py-4 bg-primary text-[#f5f5f5] hover:bg-primary/80 cursor-pointer rounded-full font-semibold shadow-2xl transition-all duration-300">
            {t("hero.cta")}
          </button>
        </motion.div>
      </section>
      {/* Who We Are */}
      <section className="py-24 px-6 max-w-6xl overflow-hidden mx-auto w-full">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
            {t("whoWeAre.title")}
          </h2>
          <p className="text-lg   max-w-3xl mx-auto">{t("whoWeAre.text1")}</p>
        </motion.div>
        <div className="grid text-accent-foreground md:grid-cols-2 gap-12 lg:gap-24 items-center w-full">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Image
              src={`/aboutus/side3.webp`}
              alt="Team at work"
              width={600}
              height={400}
              className="rounded-2xl object-cover w-full h-[300px] md:h-[400px] shadow-2xl transform hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="text-lg leading-relaxed mb-4">
              {t("whoWeAre.text2")}
            </p>
            <p className="text-lg leading-relaxed mb-4">
              {t("whoWeAre.text3")}
            </p>
            <p className="text-lg leading-relaxed">{t("whoWeAre.text4")}</p>
          </motion.div>
        </div>
      </section>
      {/* Mission & Vision */}
      <section className="py-24 px-6 overflow-hidden w-full">
        <div className="max-w-7xl mx-auto space-y-24 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              className="max-w-md"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-4 flex items-center gap-4">
                <Target size={48} className="text-primary/40" />
                {t("mission.title")}
              </h2>
              <p className="text-lg text-accent-foreground leading-relaxed">
                {t("mission.text")}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <Image
                src={`/aboutus/side.webp`}
                alt="Mission"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl object-cover w-full h-[300px] md:h-[400px] transform hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              className="order-1 md:order-1 max-w-md"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-4 flex items-center gap-4">
                <Heart size={48} className="text-primary/40" />
                {t("vision.title")}
              </h2>
              <p className="text-lg text-accent-foreground leading-relaxed">
                {t("vision.text")}
              </p>
            </motion.div>
            <motion.div
              className="order-1 md:order-2"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <Image
                src={`/aboutus/side4.webp`}
                alt="Vision"
                width={600}
                height={400}
                className="rounded-3xl shadow-2xl object-cover w-full h-[400px] transform hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          </div>
        </div>
      </section>
      {/* Values */}
      <section className="py-24 px-6 overflow-hidden w-full">
        <div className="max-w-7xl mx-auto text-center w-full">
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-primary mb-16"
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {t("values.title")}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {VALUES.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  className="p-8 bg-card border-2 hover:border-[#d23e3e]/30  rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
                  initial={{ opacity: 0, scale: 0.8, y: 40 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 15,
                    delay: i * 0.15,
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.div
                    className="text-primary mb-4"
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                      delay: i * 0.2,
                    }}
                  >
                    <div className="mb-6 p-4 bg-linear-to-br from-[#d23e3e] to-[#a83232] rounded-2xl inline-block group-hover:scale-110 transition-transform duration-300">
                      <Icon size={48} className="text-white" />
                    </div>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    {t(`values.${item.key}.title`)}
                  </h3>
                  <p className="text-accent-foreground">
                    {t(`values.${item.key}.text`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Our Work */}
      <section className="py-24 px-6 overflow-hidden w-full">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            className="text-center  mb-16"
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
              {t("work.title")}
            </h2>
            <p className="text-lg text-accent-foreground max-w-3xl mx-auto">
              {t("work.intro")}
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {WORK_AREAS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  className=" p-8 rounded-2xl  border-2 hover:border-[#d23e3e]/30 bg-card shadow-lg flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 15,
                    delay: i * 0.2,
                  }}
                >
                  <motion.div
                    className="text-primary mb-4"
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                      delay: i * 0.2,
                    }}
                  >
                    <div className="mb-6 p-4 bg-linear-to-br from-[#d23e3e]/10 to-[#a83232]/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <Icon
                        size={64}
                        className="text-[#d23e3e] dark:text-[#f5f5f5]"
                      />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-2">
                    {t(`work.${item.key}.title`)}
                  </h3>
                  <p className="text-accent-foreground">
                    {t(`work.${item.key}.text`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Why Choose Us */}
      <section className="py-24 overflow-hidden px-6 w-full">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            className="text-center mb-16 "
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
              {t("whyChoose.title")}
            </h2>
          </motion.div>
          <div className="space-y-12">
            {WHY_CHOOSE_US_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  className={`flex flex-col bg-card md:flex-row items-center text-center group gap-6 p-8  rounded-2xl shadow-md hover:shadow-xl transition-all duration-300  ${isArabic ? "border-l-4 ease-in-out duration-300 hover:border-l-8" : "border-r-4  ease-in-out duration-300 hover:border-r-8"} border-[#d23e3e] dark:border-[#f5f5f5]  "
                 ${
                   isArabic ? "md:text-right" : "text-left"
                 } gap-6 p-6 rounded-2xl  shadow-lg`}
                  initial={{ opacity: 0, x: 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                    delay: i * 0.15,
                  }}
                >
                  <motion.div
                    className="flex-shrink-0 text-primary"
                    animate={{ x: [0, 5, 0, -5, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                      delay: i * 0.5,
                    }}
                  >
                    <div className="flex-shrink-0 p-4 bg-linear-to-br from-[#d23e3e] to-[#a83232] rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <Icon className="text-white" size={48} />
                    </div>
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold dark:text-[#f5f5f5] text-primary mb-2">
                      {t(`whyChoose.${item.key}.title`)}
                    </h3>
                    <p className="text-accent-foreground">
                      {t(`whyChoose.${item.key}.text`)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Join Us CTA */}
      <section className="relative py-24 text-center text-white overflow-hidden w-full">
        <Image
          src={`/aboutus/hero3.webp`}
          alt="Join Us"
          fill
          className="absolute inset-0 z-0 object-cover"
        />
        <div className="absolute inset-0 bg-black/70 z-10" />
        <motion.div
          className="relative z-20 max-w-4xl mx-auto px-4 w-full"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-lg">
            {t("joinUs.title")}
          </h2>
          <p className="text-lg md:text-xl mb-8 font-light drop-shadow-md">
            {t("joinUs.text")}
          </p>
          <button className="px-8 py-4 cursor-pointer bg-primary text-white hover:bg-primary/80 rounded-full font-semibold shadow-2xl transition-all duration-300">
            {t("joinUs.cta")}
          </button>
        </motion.div>
      </section>
      {/* Contact Section */}=
      <section className="py-24 px-6 max-w-6xl mx-auto overflow-hidden text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl font-extrabold text-primary mb-6">
            {t("contact.title")}
          </h2>

          <div className="space-y-2 text-accent-foreground">
            <p>{t("contact.address")}</p>
            <p>{t("contact.email")}</p>
            <p>{t("contact.phone")}</p>
            <p>{t("contact.whatsapp")}</p>
          </div>

          {/* <p className="mt-8 text-lg font-semibold">{t("contact.follow")}</p> */}

          {/* 🌐 Social Links */}
          <div className="flex justify-center gap-4 mt-8">
            <a
              href="https://www.facebook.com/HopeCharityBridge"
              className="group p-4 rounded-full bg-linear-to-br from-[#d23e3e] to-[#a83232] hover:shadow-lg hover:shadow-[#d23e3e]/50 transition-all duration-300 hover:scale-110"
            >
              <Facebook className="w-6 h-6 text-white" />
            </a>

            <a
              href="https://www.instagram.com/hope_bridge_hba"
              className="group p-4 rounded-full bg-linear-to-br from-[#d23e3e] to-[#a83232] hover:shadow-lg hover:shadow-[#d23e3e]/50 transition-all duration-300 hover:scale-110"
            >
              <Instagram className="w-6 h-6 text-white" />
            </a>

            <a
              href="https://www.tiktok.com/@hopebridgecharity"
              className="group p-4 rounded-full bg-linear-to-br from-[#d23e3e] to-[#a83232] hover:shadow-lg hover:shadow-[#d23e3e]/50 transition-all duration-300 hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                viewBox="0 0 24 24"
                className="w-6 h-6"
              >
                <path d="M12.9 2c.3 2.2 1.8 3.9 3.8 4.4v2.4c-1.1 0-2.2-.3-3.2-.9v7.4a5.3 5.3 0 1 1-5.3-5.3c.4 0 .8 0 1.1.1v2.5a2.7 2.7 0 1 0 1.9 2.6V2h1.7z" />
              </svg>
            </a>

            <a
              href="https://x.com/HopeBridge_HBA"
              className="group p-4 rounded-full bg-linear-to-br from-[#d23e3e] to-[#a83232] hover:shadow-lg hover:shadow-[#d23e3e]/50 transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            <a
              href="https://www.linkedin.com/company/hopebridge-association"
              className="group p-4 rounded-full bg-linear-to-br from-[#d23e3e] to-[#a83232] hover:shadow-lg hover:shadow-[#d23e3e]/50 transition-all duration-300 hover:scale-110"
            >
              <Linkedin className="w-6 h-6 text-white" />
            </a>
          </div>

          <p className="mt-8 italic text-accent-foreground">
            {t("contact.slogan")}
          </p>
        </motion.div>
      </section>
      {/* Contact Section */}
    </div>
  );
};

export default AboutUsPage;
