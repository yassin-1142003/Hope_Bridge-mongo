<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< HEAD
import type { PageProps } from "@/types/next";
=======
import Newsteller from "@/app/[locale]/components/sections/Newsteller";
import Overview from "@/app/[locale]/components/sections/Overview";
import StatsSection from "@/app/[locale]/components/sections/StatsSection";
import GazaCrisis from "@/app/[locale]/components/sections/GazaCrisis";
import ImpactStories from "@/app/[locale]/components/sections/ImpactStories";
import VolunteerSection from "@/app/[locale]/components/sections/VolunteerSection";
import PartnersSection from "@/app/[locale]/components/sections/PartnersSection";
import AlertButton from "@/components/AlertButton";
import type { PageProps } from "@/types/next";
import { lazy } from "react";
>>>>>>> 2efbb4e38f6799641e973bb9be8bca702baa4001

=======
import Newsteller from "@/app/[locale]/components/sections/Newsteller";
import Overview from "@/app/[locale]/components/sections/Overview";
import StatsSection from "@/app/[locale]/components/sections/StatsSection";
import GazaCrisis from "@/app/[locale]/components/sections/GazaCrisis";
import ImpactStories from "@/app/[locale]/components/sections/ImpactStories";
import VolunteerSection from "@/app/[locale]/components/sections/VolunteerSection";
import PartnersSection from "@/app/[locale]/components/sections/PartnersSection";
import Hero from "@/app/[locale]/components/sections/Hero";
import Projects from "@/app/[locale]/components/sections/Projects";
import type { PageProps } from "@/types/next";
import { lazy } from "react";
>>>>>>> Stashed changes
=======
import Newsteller from "@/app/[locale]/components/sections/Newsteller";
import Overview from "@/app/[locale]/components/sections/Overview";
import StatsSection from "@/app/[locale]/components/sections/StatsSection";
import GazaCrisis from "@/app/[locale]/components/sections/GazaCrisis";
import ImpactStories from "@/app/[locale]/components/sections/ImpactStories";
import VolunteerSection from "@/app/[locale]/components/sections/VolunteerSection";
import PartnersSection from "@/app/[locale]/components/sections/PartnersSection";
import Hero from "@/app/[locale]/components/sections/Hero";
import Projects from "@/app/[locale]/components/sections/Projects";
import type { PageProps } from "@/types/next";
import { lazy } from "react";
>>>>>>> Stashed changes
export default async function HomePage({
  params,
}: PageProps<{ locale: string }>) {
  const { locale } = await params;

  return (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< HEAD
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">
        {locale === 'ar' ? 'مرحباً' : 'Welcome'} - {locale}
      </h1>
    </div>
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    <>
      <Hero params={{ locale }} />
      <StatsSection params={{ locale }} />
      <Overview params={{ locale }} />
      {/* <MissionVision params={{ locale }} /> */}
      <GazaCrisis params={{ locale }} />
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      {/* <Projects params={{ locale }} /> */}
      <ImpactStories params={{ locale }} />
      {/* <VolunteerSection params={{ locale }} /> */}
      <PartnersSection params={{ locale }} />
      <Map14 params={{ locale }} />
      <Newsteller params={{ locale }} />
      <AlertButton locale={locale} />
    </>
>>>>>>> 2efbb4e38f6799641e973bb9be8bca702baa4001
=======
=======
>>>>>>> Stashed changes
      <Projects params={{ locale }} />
      <ImpactStories params={{ locale }} />
      {/* <VolunteerSection params={{ locale }} /> */}
      <PartnersSection params={{ locale }} />
      <Newsteller params={{ locale }} />
    </>
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  );
}
