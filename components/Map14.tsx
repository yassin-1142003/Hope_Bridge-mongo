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
  id: string;
  beneficiaries: number;
  contents: {
    name: string;
    description: string;
    language_code?: string;
  }[];
  images: string[];
}

const getGoogleDriveId = (url: string): string | null => {
  const match = url?.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
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
          <ellipse
            cx="0"
            cy="15"
            rx="8"
            ry="3"
            fill="#000"
            opacity={0.2}
          />
          
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
    if (activeCountry === "Palestine") {
      setIsLoadingProjects(true);
      fetch("/api/post/project")
        .then((res) => res.json())
        .then((data) => {
          if (data?.details) {
            setApiProjects(data.details);
          } else {
            setApiProjects([]);
          }
        })
        .catch(() => setApiProjects([]))
        .finally(() => setIsLoadingProjects(false));
    } else {
      setApiProjects([]);
      setIsLoadingProjects(false);
    }
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
              <Suspense fallback={<MapLoading isArabic={isArabic} isMobile={isMobile} theme={theme} />}>
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
                    background: theme === "dark" 
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
                            style={getGeoStyle(isActive, isHighlighted, theme, isMobile)}
                            onClick={() => isHighlighted && handleCountryClick(n)}
                          />
                        );
                      })
                    }
                  </Geographies>
                  {renderMarkers}
                </ComposableMap>
              </Suspense>
            ) : (
              <MapLoading isArabic={isArabic} isMobile={isMobile} theme={theme} />
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
            <Link href={`/${locale}/projects`} className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2">
              {isArabic ? "عرض الكل" : "View All"}
              <ArrowLeftIcon className="w-4 h-4" />
            </Link>
          </div>

          {isLoadingProjects ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : apiProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiProjects.slice(0, 6).map((proj: Project, index) => {
                const content =
                  proj.contents.find((c) => c.language_code === locale) ||
                  proj.contents[0];

                return (
                  <motion.div
                    key={proj.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <Link href={`/${locale}/projects/${proj.id}`}>
                      <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        {/* Image */}
                        {proj.images && proj.images.length > 0 && (
                          <div className="aspect-video overflow-hidden">
                            <Image
                              src={getImageUrl(proj.images[0])}
                              width={400}
                              height={300}
                              alt={content?.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="p-6">
                          <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {content?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {content?.description}
                          </p>
                          
                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <HeartIcon className="w-4 h-4" />
                              <span>{proj.beneficiaries?.toLocaleString() || "0"}</span>
                            </div>
                            <div className="text-primary font-semibold text-sm flex items-center gap-1">
                              {isArabic ? "التفاصيل" : "Details"}
                              <ArrowLeftIcon className="w-3 h-3" />
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
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-muted-foreground">
                {isArabic 
                  ? "لا توجد مشاريع متاحة حالياً." 
                  : "No projects available currently."}
              </p>
            </div>
          )}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center py-12"
        >
          <div className="bg-primary/10 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {isArabic ? "ساعدنا في إحداث فرق" : "Help Us Make a Difference"}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isArabic 
                ? "انضم إلينا في مهمتنا لتحسين حياة الناس في communities حول العالم" 
                : "Join us in our mission to improve lives in communities around the world"}
            </p>
            <Link href={`/${locale}/projects`} className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors shadow-lg">
              {isArabic ? "اكتشف المشاريع" : "Explore Projects"}
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Map14;
