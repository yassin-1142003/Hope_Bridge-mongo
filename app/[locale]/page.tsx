import Newsteller from "@/app/[locale]/components/sections/Newsteller";
import Overview from "@/app/[locale]/components/sections/Overview";
import StatsSection from "@/app/[locale]/components/sections/StatsSection";
import GazaCrisis from "@/app/[locale]/components/sections/GazaCrisis";
import ImpactStories from "@/app/[locale]/components/sections/ImpactStories";
import VolunteerSection from "@/app/[locale]/components/sections/VolunteerSection";
import PartnersSection from "@/app/[locale]/components/sections/PartnersSection";
import type { PageProps } from "@/types/next";
import { lazy } from "react";
export default async function HomePage({
  params,
}: PageProps<{ locale: string }>) {
  const { locale } = await params;
  // const News = lazy(() => import("@/app/[locale]/components/sections/News"));
  const Projects = lazy(
    () => import("@/app/[locale]/components/sections/Projects")
  );
  const Hero = lazy(() => import("@/app/[locale]/components/sections/Hero"));
  // const Map = lazy(() => import("../../components/Map"));
  // const Map2 = lazy(() => import("../../components/Map2"));
  // const Map3 = lazy(() => import("../../components/Map3"));
  // const Map4 = lazy(() => import("../../components/Map4"));
  // const Map5 = lazy(() => import("../../components/Map5"));
  // const Map6 = lazy(() => import("../../components/Map6"));
  // const Map7 = lazy(() => import("../../components/Map7"));
  // const Map8 = lazy(() => import("../../components/Map8"));
  // const Map9 = lazy(() => import("../../components/Map9"));
  // const Map10 = lazy(() => import("../../components/Map10"));
  // const Map11 = lazy(() => import("../../components/Map11"));
  // const Map12 = lazy(() => import("../../components/Map12"));
  // const Map13 = lazy(() => import("../../components/Map13"));
  const Map14 = lazy(() => import("../../components/Map14"));

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
      <Map14 params={{ locale }} />
      <Newsteller params={{ locale }} />
    </>
  );
}
