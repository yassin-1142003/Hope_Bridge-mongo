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

export default async function HomePage({
  params,
}: PageProps<{ locale: string }>) {
  const { locale } = await params;

  return (
    <>
      <Hero params={{ locale }} />
      <StatsSection params={{ locale }} />
      <Overview params={{ locale }} />
      {/* <MissionVision params={{ locale }} /> */}
      <GazaCrisis params={{ locale }} />
      <Projects params={{ locale }} />
      <ImpactStories params={{ locale }} />
      {/* <VolunteerSection params={{ locale }} /> */}
      <PartnersSection params={{ locale }} />
      <Newsteller params={{ locale }} />
    </>
  );
}
