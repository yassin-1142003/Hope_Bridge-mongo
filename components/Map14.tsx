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
import { ArrowLeftIcon } from "lucide-react";
import Image from "next/image";
import { ZoomableGroup } from "react-simple-maps";

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
// const ZoomableGroup = lazy(() =>
//   import("react-simple-maps").then((m) => ({ default: m.ZoomableGroup }))
// );

// Lightweight topojson
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Target countries
const highlighted = [
  // "Egypt",
  // "Saudi Arabia",
  // "Iraq",
  // "Syria",
  "Palestine",
  // "Algeria",
  // "Morocco",
  // "Pakistan",
];

// Pins coordinates
const pinsCoords: Record<string, [number, number]> = {
  // Egypt: [31, 27],
  // "Saudi Arabia": [45, 23],
  // Iraq: [44, 33],
  // Syria: [38, 35],
  Palestine: [35, 31.5],
  // Algeria: [3, 28],
  // Morocco: [-6, 31],
  // Pakistan: [69, 30],
};

const pinOffsets: Record<string, [number, number]> = {
  Palestine: [0.8, -0.3],
  Lebanon: [0.7, -0.2],
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
  // Egypt: {
  //   title: { ar: "مشاريع مصر", en: "Egypt Projects" },
  //   description: {
  //     ar: "تنفيذ مشروعات صحية وتعليمية وإغاثية شاملة تهدف إلى تحسين جودة الحياة.",
  //     en: "Implementing comprehensive health, education, and relief projects to improve quality of life.",
  //   },
  //   stats: { ar: "المستفيدون: 5,000 شخص", en: "Beneficiaries: 5,000 people" },
  //   beneficiaries: 5000,
  //   projects: 12,
  //   year: "2025",
  // },
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
  // "Saudi Arabia": {
  //   title: { ar: "مشاريع السعودية", en: "Saudi Arabia Projects" },
  //   description: {
  //     ar: "برامج تنموية مستدامة تركز على التعليم والصحة والرعاية الاجتماعية.",
  //     en: "Sustainable development programs focused on education, health, and social care.",
  //   },
  //   stats: { ar: "المستفيدون: 3,500 شخص", en: "Beneficiaries: 3,500 people" },
  //   beneficiaries: 3500,
  //   projects: 15,
  //   year: "2025",
  // },
  // Iraq: {
  //   title: { ar: "مشاريع العراق", en: "Iraq Projects" },
  //   description: {
  //     ar: "إعادة بناء المجتمعات المتضررة وتوفير الخدمات الأساسية.",
  //     en: "Rebuilding affected communities and providing essential services.",
  //   },
  //   stats: { ar: "المستفيدون: 4,200 شخص", en: "Beneficiaries: 4,200 people" },
  //   beneficiaries: 4200,
  //   projects: 10,
  //   year: "2025",
  // },
  // Syria: {
  //   title: { ar: "مشاريع سوريا", en: "Syria Projects" },
  //   description: {
  //     ar: "مساعدة اللاجئين والنازحين داخلياً بالخدمات الطارئة والدعم النفسي.",
  //     en: "Helping refugees and internally displaced persons with emergency services and psychological support.",
  //   },
  //   stats: { ar: "المستفيدون: 7,800 شخص", en: "Beneficiaries: 7,800 people" },
  //   beneficiaries: 7800,
  //   projects: 18,
  //   year: "2025",
  // },
  // Algeria: {
  //   title: { ar: "مشاريع الجزائر", en: "Algeria Projects" },
  //   description: {
  //     ar: "مشروعات تنموية وخدمية لدعم الأسر الفقيرة وتحسين مستوى المعيشة.",
  //     en: "Development and service projects to support poor families and improve living standards.",
  //   },
  //   stats: { ar: "المستفيدون: 4,500 شخص", en: "Beneficiaries: 4,500 people" },
  //   beneficiaries: 4500,
  //   projects: 9,
  //   year: "2025",
  // },
  // Morocco: {
  //   title: { ar: "مشاريع المغرب", en: "Morocco Projects" },
  //   description: {
  //     ar: "برامج تعليمية وصحية لدعم المجتمعات المحتاجة وتحقيق التنمية المستدامة.",
  //     en: "Educational and health programs to support needy communities and achieve sustainable development.",
  //   },
  //   stats: { ar: "المستفيدون: 5,200 شخص", en: "Beneficiaries: 5,200 people" },
  //   beneficiaries: 5200,
  //   projects: 11,
  //   year: "2025",
  // },
  // Pakistan: {
  //   title: { ar: "مشاريع باكستان", en: "Pakistan Projects" },
  //   description: {
  //     ar: "مبادرات إغاثية وصحية لدعم المتضررين من الكوارث والفقراء.",
  //     en: "Relief and health initiatives to support disaster-affected people and the poor.",
  //   },
  //   stats: { ar: "المستفيدون: 6,700 شخص", en: "Beneficiaries: 6,700 people" },
  //   beneficiaries: 6700,
  //   projects: 14,
  //   year: "2025",
  // },
};

// Prevent creating style object on every render
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
        ? isDark
          ? "#D2C1B6"
          : "#E43636"
        : isHighlighted
          ? isDark
            ? "#456882"
            : "#E2DDB4"
          : isDark
            ? "#1B3C53"
            : "#F6EFD2",
      stroke: isDark ? "#1B3C53" : "#F6EFD2",
      strokeWidth: isMobile ? 1 : 1,
      outline: "none",
      transition: isHighlighted ? "all 0.3s ease-in-out" : "none",
    },
    hover: {
      fill: isHighlighted
        ? isDark
          ? "#D2C1B6"
          : "#E43636"
        : isDark
          ? "#D2C1B6"
          : "#E43636",
      cursor: isHighlighted ? "pointer" : "default",
      outline: "none",
    },
    pressed: { outline: "none" },
  };
};

// Loading skeleton
const MapLoading = ({
  isMobile,
  isArabic,
  theme,
}: {
  isMobile: boolean;
  isArabic: boolean;
  theme?: string;
}) => {
  const height = isMobile ? 250 : 550;

  return (
    <div
      className="flex items-center justify-center rounded-2xl animate-pulse"
      style={{
        width: "100%",
        height,
        background: theme === "dark" ? "#1D1616" : "#f9f9f9",
      }}
    >
      <div className="text-gray-500 dark:text-gray-400">
        {isArabic ? "جاري التحميل..." : "Loading..."}
      </div>
    </div>
  );
};

// Memoized marker
type MarkerProps = {
  country: string;
  coords: [number, number];
  isActive: boolean;
  isMobile: boolean;
  theme?: string;
  onClick: () => void;
  isArabic: boolean;
};

const countryNames: Record<string, { ar: string; en: string }> = {
  //Egypt: { ar: "مصر", en: "Egypt" },
  // "Saudi Arabia": { ar: "السعودية", en: "Saudi Arabia" },
  // Iraq: { ar: "العراق", en: "Iraq" },
  // Syria: { ar: "سوريا", en: "Syria" },
  Palestine: { ar: "فلسطين", en: "Palestine" },
  // Algeria: { ar: "الجزائر", en: "Algeria" },
  // Morocco: { ar: "المغرب", en: "Morocco" },
  // Pakistan: { ar: "باكستان", en: "Pakistan" },
};

const MarkerComponent = ({
  country,
  isArabic,
  coords,
  isActive,
  isMobile,
  theme,
  onClick,
}: MarkerProps) => {
  const pinScale = isMobile ? 0.6 : 1;

  return (
    <Marker coordinates={coords}>
      <motion.g
        initial={{ scale: pinScale }}
        animate={{
          scale: isActive ? [pinScale, pinScale * 1.4, pinScale] : pinScale,
        }}
        transition={{
          repeat: isActive ? Infinity : 0,
          duration: 1.5,
          ease: "easeInOut",
        }}
        onClick={onClick}
        style={{ cursor: "pointer" }}
      >
        <path
          d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"
          fill="#1E93AB"
          stroke={theme === "dark" ? "#111" : "#333"}
          strokeWidth={0.6}
          transform={`${
            isMobile ? "translate(-10, -17)" : "translate(-20, -35)"
          } scale(${pinScale})`}
        />
        <circle
          cx="12"
          cy="9"
          r="3.5"
          fill="#B22222"
          stroke="#fff"
          strokeWidth={0.7}
          transform={`${
            isMobile ? "translate(-10, -17)" : "translate(-20, -35)"
          } scale(${pinScale})`}
        />
      </motion.g>
      <text
        textAnchor="middle"
        y={3}
        x={-5}
        fontSize={isMobile ? 5 : 8}
        fontWeight="bold"
        fill={isActive ? "#1B3C53" : theme === "dark" ? "#fff" : "#000000"}
        style={{ userSelect: "none", cursor: "pointer" }}
        onClick={onClick}
      >
        {isArabic
          ? countryNames[country]?.ar || country
          : countryNames[country]?.en || country}
      </text>
    </Marker>
  );
};

const OptimizedMarker = memo(MarkerComponent);
OptimizedMarker.displayName = "OptimizedMarker";

const ArabicMap = ({ params }: { params: { locale: string } }) => {
  const { locale } = params;
  const isArabic = locale === "ar";
  const { theme } = useTheme();
  const [activeCountry, setActiveCountry] = useState("Palestine");
  const [isMobile, setIsMobile] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [apiProjects, setApiProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  // Inside ArabicMap Component

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
      // Clear projects if not Palestine
      setApiProjects([]);
      setIsLoadingProjects(false);
    }
  }, [activeCountry]);

  //   const fetcher = (url: string) => fetch(url).then((res) => res.json());
  //   const { data, error } = useSWR("/api/post/project", fetcher, {
  //     revalidateOnFocus: false,
  //     revalidateOnReconnect: false,
  //     revalidateIfStale: false,
  //     dedupingInterval: 60000, // 1 minute cache
  //   });

  //   useEffect(() => {
  //     if (data?.details) {
  //       setApiProjects(data.details.slice(0, 2)); // Limit to first 6 projects
  //       setIsLoadingProjects(false);
  //     }
  //   }, [data]);

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
        let coords = pinsCoords[c];
        if (!coords) return null;

        if (pinOffsets[c]) {
          coords = [coords[0] + pinOffsets[c][0], coords[1] + pinOffsets[c][1]];
        }

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
    <div className="w-full flex flex-col items-center gap-4 px-4">
      <div className="w-full max-w-6xl">
        <Swiper
          spaceBetween={8}
          dir={isArabic ? "rtl" : "ltr"}
          slidesPerView="auto"
          className="w-full"
        >
          {highlighted.map((c) => (
            <SwiperSlide key={c} style={{ width: "auto" }}>
              <button
                onClick={() => handleCountryClick(c)}
                className={`px-3 py-2 cursor-pointer rounded-lg text-xs md:text-sm font-semibold transition-all ${
                  activeCountry === c
                    ? "bg-gradient-to-r from-red-600 to-red-500 text-white"
                    : theme === "dark"
                      ? "bg-gray-800 text-gray-200"
                      : "bg-gray-100 text-accent-foreground"
                }`}
              >
                {countryNames[c]
                  ? isArabic
                    ? countryNames[c].ar
                    : countryNames[c].en
                  : c}
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {/* Map + Card Layout */}
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6">
        {/* Card */}
        <motion.div
          dir="rtl"
          className="w-full lg:w-1/2 rounded-2xl bg-gradient-to-r p-[1px] from-primary via-[#8e1616] to-primary shadow-lg"
        >
          <div className="bg-white px-6 py-2  h-full dark:bg-gray-900 rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-1 text-xs flex items-center gap-1 rounded-full bg-green-100 text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {isArabic ? "نشط الآن" : "Active Now"}
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {currentProject.year}
              </span>
            </div>

            {/* Title + Desc */}
            <h2 className="text-lg font-bold text-accent-foreground dark:text-gray-100 mb-2">
              {isArabic ? currentProject.title.ar : currentProject.title.en}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {isArabic
                ? currentProject.description.ar
                : currentProject.description.en}
            </p>

            {/* Stats Section */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center shadow-sm">
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {currentProject.beneficiaries.toLocaleString() || "500"}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {isArabic ? "عدد المستفيدين" : " Number of beneficiaries"}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center shadow-sm">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {apiProjects.length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {isArabic ? "عدد المشاريع" : " Number of projects"}
                </p>
              </div>
            </div>

            {/* Related Projects */}
            <h3
              dir={isArabic ? "rtl" : "ltr"}
              className="font-semibold mt-6 text-accent-foreground dark:text-gray-100"
            >
              {isArabic ? "بعض من مشاريعنا:" : "Some of our projects"}
            </h3>
            {isLoadingProjects ? (
              <div className="mt-3 text-sm text-gray-500">جاري التحميل...</div>
            ) : apiProjects.length > 0 ? (
              <Swiper
                spaceBetween={12}
                slidesPerView={1.1}
                breakpoints={{
                  640: { slidesPerView: 2 }, // 2 cards per row on sm+
                  1024: { slidesPerView: 2 }, // 2 on desktop
                }}
                className="mt-3"
              >
                {apiProjects.slice(0, 3).map((proj: Project) => {
                  const content =
                    proj.contents.find((c) => c.language_code === locale) ||
                    proj.contents[0];

                  return (
                    <SwiperSlide key={proj.id}>
                      <Link
                        href={`/${locale}/projects/${proj.id}`}
                        className="group flex flex-col justify-between rounded-xl border border-gray-200 
              dark:border-gray-700 p-3 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md 
              hover:border-red-400 transition-all duration-300 h-full"
                      >
                        {/* Title */}
                        <h1 className="font-bold text-sm text-primary mb-1 group-hover:text-red-600 line-clamp-1">
                          {content?.name}
                        </h1>

                        {/* Description */}
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                          {content?.description}
                        </p>

                        {/* Gallery */}
                        {proj.images && proj.images.length > 0 && (
                          <div className="mt-2">
                            <Swiper spaceBetween={8} slidesPerView={1.1}>
                              {proj.images.slice(0, 3).map((img, idx) => (
                                <SwiperSlide key={idx}>
                                  <Image
                                    src={getImageUrl(img)}
                                    width={600}
                                    height={600}
                                    alt={`Preview ${idx + 1}`}
                                    className="w-full h-24 object-cover rounded-md border border-gray-200 
                          dark:border-gray-700 hover:scale-105 transition-transform"
                                  />
                                </SwiperSlide>
                              ))}
                            </Swiper>
                          </div>
                        )}

                        {/* Footer */}
                        <div
                          dir={isArabic ? "rtl" : "ltr"}
                          className="flex items-center justify-between text-xs font-medium mt-auto pt-2 border-t border-gray-100 dark:border-gray-700"
                        >
                          <span className="text-gray-500 dark:text-gray-400">
                            👥 {proj.beneficiaries?.toLocaleString() || "800"}
                          </span>
                          <span className="text-red-500 font-semibold group-hover:translate-x-1 transition">
                            {isArabic ? "المزيد →" : "More →"}
                          </span>
                        </div>
                      </Link>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            ) : (
              <p className="mt-2 text-sm text-gray-500">
                {isArabic
                  ? "لا توجد مشاريع متاحة حالياً."
                  : "No projects available currently."}
              </p>
            )}

            {/* Button */}
            <Link dir={isArabic ? "rtl" : "ltr"} href={`/${locale}/projects`}>
              <div className="flex items-center gap-2 mt-4 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-500">
                <ArrowLeftIcon className="w-4 h-4" />
                {isArabic ? "عرض جميع المشاريع" : "View All Projects"}
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Map */}
        <div id="map-container" className="w-full h-[500px] lg:w-1/2 flex">
          {isMobile ? (
            <div className="w-full h-full overflow-hidden rounded-2xl shadow-xl">
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
                      center: [30, 25],
                      scale: 1000,
                    }}
                    width={350}
                    height={250}
                    style={{
                      width: "100%",
                      height: "100%",
                      background: theme === "dark" ? "#1d1616" : "#f5f5f5",
                      borderRadius: "16px",
                      touchAction: "auto", // ✅ allows scrolling
                      pointerEvents: "auto", // ✅ unblocks normal touch
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
          ) : (
            <div className="w-full h-full overflow-hidden rounded-2xl shadow-xl">
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
                      center: [30, 25],

                      // scale: isMobile ? 280 : 550,
                      scale: isMobile ? 280 : 1550,
                    }}
                    width={isMobile ? 350 : 800}
                    height={isMobile ? 250 : 450}
                    style={{
                      width: "100%",
                      height: "100%",
                      background: theme === "dark" ? "#1d1616" : "#f5f5f5",
                      borderRadius: "16px",
                    }}
                  >
                    {/* <ZoomableGroup
                      center={[30, 25]}
                      zoom={1}
                      translateExtent={
                        isMobile
                          ? [
                              [0, 0],
                              [350, 250],
                            ]
                          : [
                              [0, 0],
                              [900, 550],
                            ]
                      }
                    > */}
                    <Geographies geography={geoUrl}>
                      {({ geographies }) =>
                        geographies.map((geo) => {
                          let n = geo.properties.name;

                          // Merge Israel into Palestine
                          if (n === "Israel") {
                            n = "Palestine";
                          }

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
                    {/* </ZoomableGroup> */}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ArabicMap;
