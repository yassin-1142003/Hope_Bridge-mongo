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
      className="relative flex flex-col overflow-hidden text-accent-foreground text-center items-center px-4 "
      aria-label="Hero Section"
    >
      {/* Header Content */}
      <div className="flex flex-col items-center justify-center max-w-5xl mx-auto space-y-6 mb-8">
        <h2 className="text-sm md:text-lg lg:text-xl font-bold text-muted-foreground animate-fade-in">
          {highlightWord(upperText, highlightTargetUpper, "text-primary")}
        </h2>
        <h1 className="text-2xl md:text-4xl font-black text-primary leading-tight animate-fade-in-up">
          {t("maintext")}
        </h1>
        <p className="px-4 leading-relaxed text-sm md:text-base lg:text-lg font-medium max-w-3xl text-muted-foreground animate-fade-in-up">
          {highlightWord(subText, highlightTargetSub, "text-primary")}
        </p>
      </div>
      {/* Roller Component - Centered */}
      <div className="relative w-full mt-2  md:-mt-10 h-[280px] md:h-[320px] mb-0 md:mb-20">
        <RollerComponent />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-row items-center justify-center gap-4 md:gap-6 mb-10 animate-fade-in-up">
        <HeroDonate />
        <Link href={`/${locale}/about`}>
          <Button className="w-24 md:w-32 lg:w-40 h-12 md:h-14 bg-background cursor-pointer text-sm md:text-base lg:text-lg px-4 md:px-6 border-2 border-primary text-primary duration-300 transition ease-in-out hover:text-background hover:bg-primary font-bold rounded-lg shadow-sm hover:shadow-md">
            {t("about")}
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
