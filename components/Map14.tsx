"use client";

import {
  lazy,
  Suspense,
  useMemo,
  useCallback,
  memo,
  useEffect,
  useState,
} from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Link from "next/link";
import { ArrowLeftIcon, MapPinIcon, HeartIcon, UsersIcon } from "lucide-react";
import Image from "next/image";

interface Project {
  _id: string;
  contents: {
    language_code: string;
    name: string;
    description: string;
    content: string;
    images: string[];
    videos: string[];
    documents: string[];
  }[];
  bannerPhotoUrl?: string;
  gallery?: string[];
  createdAt: string | { $date: string };
  updatedAt: string | { $date: string };
}

const getGoogleDriveId = (url: string): string | null => {
  const match = url?.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

const formatDate = (dateString: string | { $date: string }, locale: string) => {
  const dateStr =
    typeof dateString === "string" ? dateString : dateString.$date;
  return new Date(dateStr).toLocaleDateString(locale, {
    month: "short",
    year: "numeric",
  });
};

const getImageUrl = (url: string): string => {
  const fileId = getGoogleDriveId(url);
  return fileId
    ? `https://drive.google.com/uc?export=view&id=${fileId}`
    : url || "https://placehold.net/600x400.png?text=No+Image";
};

// Lazy load the map components
const ComposableMap = lazy(() =>
  import("react-simple-maps").then((m) => ({ default: m.ComposableMap }))
);
const Geographies = lazy(() =>
  import("react-simple-maps").then((m) => ({ default: m.Geographies }))
);
const Geography = lazy(() =>
  import("react-simple-maps").then((m) => ({ default: m.Geography }))
);
const Marker = lazy(() =>
  import("react-simple-maps").then((m) => ({ default: m.Marker }))
);

// Lightweight topojson
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Target countries
const highlighted = ["Palestine"];

// Pins coordinates
const pinsCoords: Record<string, [number, number]> = {
  Palestine: [35, 31.5],
};

const projectsData: Record<
  string,
  {
    title: { ar: string; en: string };
    description: { ar: string; en: string };
    stats: { ar: string; en: string };
    beneficiaries: number;
    projects: number;
    year: string;
  }
> = {
  Palestine: {
    title: { ar: "مشاريع فلسطين", en: "Palestine Projects" },
    description: {
      ar: "دعم الأسر النازحة والمتضررة بمساعدات غذائية وطبية وتعليمية عاجلة.",
      en: "Supporting displaced and affected families with urgent food, medical, and educational aid.",
    },
    stats: { ar: "المستفيدون: 6,000 شخص", en: "Beneficiaries: 6,000 people" },
    beneficiaries: 6000,
    projects: 8,
    year: "2025",
  },
};

const countryNames: Record<string, { ar: string; en: string }> = {
  Palestine: { ar: "فلسطين", en: "Palestine" },
};

// Modern map styling using website colors
const getGeoStyle = (
  isActive: boolean,
  isHighlighted: boolean,
  theme: string | undefined,
  isMobile: boolean
) => {
  const isDark = theme === "dark";

  return {
    default: {
      fill: isActive
        ? "#C62828"
        : isHighlighted
          ? isDark
            ? "#8D6E63"
            : "#FFAB91"
          : isDark
            ? "#2A2020"
            : "#F5F5F5",
      stroke: isDark ? "#2E2222" : "#E0E0E0",
      strokeWidth: isMobile ? 0.3 : 0.5,
      outline: "none",
      transition: "all 0.3s ease",
    },
    hover: {
      fill: isHighlighted ? "#C62828" : "#8D6E63",
      cursor: isHighlighted ? "pointer" : "default",
      outline: "none",
      filter: "brightness(1.1)",
    },
    pressed: {
      outline: "none",
      fill: "#D32F2F",
    },
  };
};

// Modern loading skeleton
const MapLoading = ({
  isMobile,
  isArabic,
  theme,
}: {
  isMobile: boolean;
  isArabic: boolean;
  theme?: string;
}) => {
  const height = isMobile ? 300 : 450;

  return (
    <div
      className="flex items-center justify-center rounded-2xl animate-pulse"
      // eslint-disable-next-line react/forbid-component-props
      style={{
        width: "100%",
        height,
        background: theme === "dark" ? "#2A2020" : "#F5F5F5",
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="text-muted-foreground text-sm">
          {isArabic ? "جاري التحميل..." : "Loading..."}
        </div>
      </div>
    </div>
  );
};

// Modern marker component
const MarkerComponent = ({
  country,
  isArabic,
  coords,
  isActive,
  isMobile,
  theme,
  onClick,
}: {
  country: string;
  isArabic: boolean;
  coords: [number, number];
  isActive: boolean;
  isMobile: boolean;
  theme?: string;
  onClick: () => void;
}) => {
  const pinScale = isMobile ? 0.8 : 1;
  const isDark = theme === "dark";

  return (
    <Marker coordinates={coords}>
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: pinScale, opacity: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        onClick={onClick}
        style={{ cursor: "pointer" }}
      >
        {/* Pulsing ring for active state */}
        {isActive && (
          <motion.circle
            cx="0"
            cy="0"
            r="20"
            fill="none"
            stroke="#C62828"
            strokeWidth="2"
            opacity={0.3}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}

        {/* Main pin */}
        <motion.g
          animate={{
            y: isActive ? [-2, 2, -2] : 0,
          }}
          transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
        >
          {/* Pin shadow */}
          <ellipse cx="0" cy="15" rx="8" ry="3" fill="#000" opacity={0.2} />

          {/* Pin body */}
          <path
            d="M 0 -15 C -8 -15 -15 -8 -15 0 C -15 8 -8 15 0 25 C 8 15 15 8 15 0 C 15 -8 8 -15 0 -15 Z"
            fill={isActive ? "#C62828" : isDark ? "#8D6E63" : "#FFAB91"}
            stroke={isDark ? "#2E2222" : "#FFFFFF"}
            strokeWidth="2"
          />

          {/* Inner circle */}
          <circle
            cx="0"
            cy="0"
            r="6"
            fill="#FFFFFF"
            stroke={isActive ? "#C62828" : isDark ? "#8D6E63" : "#FFAB91"}
            strokeWidth="2"
          />
        </motion.g>
      </motion.g>
    </Marker>
  );
};

const OptimizedMarker = memo(MarkerComponent);

const Map14 = ({ params }: { params: { locale: string } }) => {
  const { locale } = params;
  const isArabic = locale === "ar";
  const { theme } = useTheme();
  const [activeCountry, setActiveCountry] = useState("Palestine");
  const [isMobile, setIsMobile] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [apiProjects, setApiProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (activeCountry === "Palestine") {
        setIsLoadingProjects(true);
        try {
          // Try the same endpoint that works in Projects.tsx
          const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
          console.log("Fetching projects from:", `${baseUrl}/api/projects`);

          const res = await fetch(`${baseUrl}/api/projects`, {
            method: "GET",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
          });

          if (!res.ok) {
            console.error(
              "Failed to fetch projects:",
              res.status,
              res.statusText
            );
            throw new Error(`HTTP error! status: ${res.status}`);
          }

          const data = await res.json();
          console.log("API Response:", data);

          if (data?.data && Array.isArray(data.data)) {
            setApiProjects(data.data);
            console.log("Projects loaded:", data.data.length);
          } else {
            console.warn("No projects found in response");
            setApiProjects([]);
          }
        } catch (error) {
          console.error("Error fetching projects:", error);
          setApiProjects([]);
        } finally {
          setIsLoadingProjects(false);
        }
      } else {
        setApiProjects([]);
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [activeCountry]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setIsMapVisible(true);
      },
      { threshold: 0.1 }
    );
    const el = document.getElementById("map-container");
    if (el) obs.observe(el);

    return () => {
      window.removeEventListener("resize", checkMobile);
      obs.disconnect();
    };
  }, []);

  const currentProject = useMemo(
    () =>
      projectsData[activeCountry] || {
        title: { ar: activeCountry, en: activeCountry },
        description: {
          ar: "لا توجد تفاصيل متاحة لهذه الدولة.",
          en: "No details available for this country.",
        },
        stats: { ar: "", en: "" },
        beneficiaries: 0,
        projects: 0,
        year: "2025",
      },
    [activeCountry]
  );

  const handleCountryClick = useCallback((c: string) => {
    setActiveCountry(c);
  }, []);

  const renderMarkers = useMemo(
    () =>
      highlighted.map((c) => {
        const coords = pinsCoords[c];
        if (!coords) return null;

        return (
          <OptimizedMarker
            key={c}
            country={c}
            coords={coords}
            isActive={activeCountry === c}
            isMobile={isMobile}
            theme={theme}
            onClick={() => handleCountryClick(c)}
            isArabic={isArabic}
          />
        );
      }),
    [activeCountry, isMobile, theme, handleCountryClick, isArabic]
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          {isArabic ? "خريطة التأثير" : "Impact Map"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {isArabic
            ? "استكشف كيف نحدث فرقاً في communities حول العالم"
            : "Explore how we're making a difference in communities worldwide"}
        </p>
      </motion.div>

      {/* Main Content - Vertical Layout */}
      <div className="space-y-12">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Beneficiaries Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/10 rounded-2xl transform group-hover:scale-105 transition-transform"></div>
            <div className="relative bg-card border border-border rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">
                {currentProject.beneficiaries.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {isArabic ? "المستفيدون" : "Beneficiaries"}
              </div>
            </div>
          </div>

          {/* Projects Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-chart-4/10 rounded-2xl transform group-hover:scale-105 transition-transform"></div>
            <div className="relative bg-card border border-border rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-chart-4/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="w-6 h-6 text-chart-4" />
              </div>
              <div className="text-3xl font-bold text-chart-4 mb-2">
                {apiProjects.length}
              </div>
              <div className="text-sm text-muted-foreground">
                {isArabic ? "المشاريع النشطة" : "Active Projects"}
              </div>
            </div>
          </div>

          {/* Countries Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-chart-3/10 rounded-2xl transform group-hover:scale-105 transition-transform"></div>
            <div className="relative bg-card border border-border rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-chart-3/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="w-6 h-6 text-chart-3" />
              </div>
              <div className="text-3xl font-bold text-chart-3 mb-2">
                {highlighted.length}
              </div>
              <div className="text-sm text-muted-foreground">
                {isArabic ? "البلدان" : "Countries"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-3xl border border-border overflow-hidden shadow-lg"
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {isArabic ? "مواقع مشاريعنا" : "Our Project Locations"}
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">
                  {isArabic ? "نشط" : "Active"}
                </span>
              </div>
            </div>
          </div>

          <div id="map-container" className="h-[450px] p-6">
            {isMapVisible ? (
              <Suspense
                fallback={
                  <MapLoading
                    isArabic={isArabic}
                    isMobile={isMobile}
                    theme={theme}
                  />
                }
              >
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{
                    center: [35, 31.5],
                    scale: isMobile ? 800 : 1200,
                  }}
                  width={isMobile ? 350 : 700}
                  height={isMobile ? 250 : 350}
                  style={{
                    width: "100%",
                    height: "100%",
                    background:
                      theme === "dark"
                        ? "linear-gradient(135deg, #1a1a1a 0%, #2A2020 100%)"
                        : "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)",
                    borderRadius: "16px",
                  }}
                >
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        let n = geo.properties.name;
                        if (n === "Israel") n = "Palestine";

                        const isHighlighted = highlighted.includes(n);
                        const isActive = activeCountry === n;

                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            style={getGeoStyle(
                              isActive,
                              isHighlighted,
                              theme,
                              isMobile
                            )}
                            onClick={() =>
                              isHighlighted && handleCountryClick(n)
                            }
                          />
                        );
                      })
                    }
                  </Geographies>
                  {renderMarkers}
                </ComposableMap>
              </Suspense>
            ) : (
              <MapLoading
                isArabic={isArabic}
                isMobile={isMobile}
                theme={theme}
              />
            )}
          </div>
        </motion.div>

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {isArabic ? "مشاريعنا" : "Our Projects"}
            </h2>
            <Link
              href={`/${locale}/projects`}
              className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
            >
              {isArabic ? "عرض الكل" : "View All"}
              <ArrowLeftIcon className="w-4 h-4" />
            </Link>
          </div>

          {isLoadingProjects ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">
                  {isArabic ? "جاري تحميل المشاريع..." : "Loading projects..."}
                </p>
              </div>
            </div>
          ) : apiProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {apiProjects.slice(0, 6).map((proj: Project, index) => {
                const content =
                  proj.contents.find((c) => c.language_code === locale) ||
                  proj.contents.find((c) => c.language_code === "en") ||
                  proj.contents[0];

                const imageUrl = proj.bannerPhotoUrl
                  ? getImageUrl(proj.bannerPhotoUrl)
                  : proj.gallery && proj.gallery.length > 0
                    ? getImageUrl(proj.gallery[0])
                    : "https://images.unsplash.com/photo-1559027618-c8e82789c944?w=600&h=400&fit=crop&crop=entropy";

                return (
                  <motion.div
                    key={proj._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <Link href={`/${locale}/projects/${proj._id}`}>
                      <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        {/* Image Section */}
                        <div className="relative aspect-video overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={content?.name || "Project image"}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                          {/* Floating badge */}
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-primary/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                              {isArabic ? "نشط" : "Active"}
                            </span>
                          </div>

                          {/* Hover overlay content */}
                          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex items-center gap-2 text-white">
                              <HeartIcon className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {isArabic
                                  ? "مشروع إنساني"
                                  : "Humanitarian Project"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-6">
                          {/* Category and Date */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-primary uppercase tracking-wider">
                              {isArabic
                                ? "مشروع إنساني"
                                : "Humanitarian Project"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(proj.createdAt, locale)}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="font-bold text-xl text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                            {content?.name}
                          </h3>

                          {/* Description */}
                          <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                            {content?.description}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <HeartIcon className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-foreground">
                                  {isArabic ? "نشط" : "Active"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {isArabic ? "مشروع" : "Project"}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                              {isArabic ? "تفاصيل" : "Details"}
                              <ArrowLeftIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {isArabic ? "لا توجد مشاريع حالياً" : "No Projects Available"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {isArabic
                  ? "لم يتم العثور على مشاريع نشطة في هذه المنطقة حالياً. يرجى التحقق لاحقاً."
                  : "No active projects found in this region currently. Please check back later."}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Map14;
