import HeroDonate from "@/components/HeroDonate";
import { highlightWord } from "../../../../components/highlightWord";
import { Button } from "../../../../components/ui/button";
//import RollingGallery from "../../../../components/RollingGallery";
import { Baby, BriefcaseMedical, CookingPot, HandHeart } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { lazy } from "react";
import RollerComponent from "@/components/RollerComponent";

const Hero = async ({ params: { locale } }: { params: { locale: string } }) => {
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const isArabic = locale === "ar";
  const highlightTargetUpper = isArabic ? "الأمل" : " hope ";
  const highlightTargetSub = isArabic ? "بالأمل" : " hope ";
  const upperText = t("uppertext");
  const subText = t("subtext");
  const statics = await getTranslations({ locale, namespace: "statics" });
  return (
    <section
      className="flex flex-col overflow-hidden text-accent-foreground  text-center items-center justify-center px-2"
      aria-label="Hero Section"
    >
      <h2 className="text-md md:text-xl lg:text-2xl font-bold">
        {highlightWord(upperText, highlightTargetUpper, "text-primary")}
      </h2>
      <h1 className="  text-xl md:text-3xl lg:text-4xl font-black  text-primary leading-tight">
        {t("maintext")}
      </h1>
      <p className="px-4 md:px-8 leading-6 md:leading-9 text-sm md:text-lg font-bold max-w-4xl">
        {highlightWord(subText, highlightTargetSub, "text-primary")}
      </p>
      <div className="flex mt-5 flex-row items-center justify-center gap-5  md:gap-10">
        <HeroDonate />
        <Link href={`/${locale}/about`}>
          <Button className="w-28 md:w-40 lg:w-52 bg-background cursor-pointer  text-md py-4 px-3 md:px-6 md:py-7 md:text-2xl  border md:border-2 border-primary text-primary duration-300 transition ease-in-out hover:text-background hover:bg-primary font-bold self-center rounded-xs">
            {t("about")}
          </Button>
        </Link>
      </div>

      <RollerComponent />

      <div
        dir={isArabic ? "rtl" : "ltr"}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl mx-auto px-4 pb-10"
      >
        {[
          {
            icon: HandHeart,
            label: statics("project"),
            value: "90",
            color: "from-green-500 to-emerald-500",
          },
          {
            icon: CookingPot,
            label: statics("food"),
            value: "20000",
            color: "from-orange-500 to-amber-500",
          },
          {
            icon: BriefcaseMedical,
            label: statics("medical"),
            value: "300",
            color: "from-blue-500 to-cyan-500",
          },
          {
            icon: Baby,
            label: statics("orphans"),
            value: "1120",
            color: "from-pink-500 to-rose-500",
          },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <div
            key={i}
            // data-aos="fade-up"
            // data-aos-delay={i * 100}
            // data-aos-duration="600"
            className="group relative flex flex-col items-center justify-center bg-card hover:bg-card/80 
  border border-border/50 hover:border-primary/30
  shadow-lg hover:shadow-xl transition-all duration-300
  p-4 sm:p-5 md:p-8 rounded-2xl overflow-hidden
  transform-gpu will-change-transform
  hover:scale-[1.03]"
          >
            {/* Gradient glow effect on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
            />

            {/* Animated background circle */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div
                className={`w-32 h-32 bg-gradient-to-br ${color} rounded-full blur-3xl opacity-20`}
              />
            </div>

            {/* Icon with gradient background */}
            <div className="relative z-10 mb-3 sm:mb-4">
              <div
                className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-lg group-hover:shadow-xl transition-transform duration-300 transform-gpu group-hover:scale-110`}
              >
                <Icon strokeWidth={1.5} className="text-white" size={32} />
              </div>
            </div>

            {/* Value with counter effect styling */}
            <h2
              className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent mb-1 sm:mb-2
        group-hover:scale-110 transition-transform duration-500"
            >
              {value}
            </h2>

            {/* Label */}
            <p className="relative z-10 text-xs sm:text-sm md:text-base font-semibold text-accent-foreground/80 group-hover:text-accent-foreground text-center transition-colors duration-300 px-2">
              {label}
            </p>

            {/* Bottom accent line */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
