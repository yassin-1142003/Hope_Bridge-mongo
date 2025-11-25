"use client";

import { lazy, Suspense, useMemo, useCallback, memo, useRef } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

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
const ZoomableGroup = lazy(() =>
  import("react-simple-maps").then((m) => ({ default: m.ZoomableGroup }))
);

// أخف topojson
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// الدول المستهدفة
const highlighted = [
  "Egypt",
  "Saudi Arabia",
  "Iraq",
  "Syria",
  "Palestine",
  "Algeria",
  "Morocco",
  "Pakistan",
];

// Pins coords
const pinsCoords: Record<string, [number, number]> = {
  Egypt: [31, 27],
  "Saudi Arabia": [45, 23],
  Iraq: [44, 33],
  Syria: [38, 35],
  Palestine: [35, 31.5],
  Algeria: [3, 28],
  Morocco: [-6, 31],
  Pakistan: [69, 30],
};

const pinOffsets: Record<string, [number, number]> = {
  Palestine: [0.8, -0.3],
  Lebanon: [0.7, -0.2],
};

const projectsData: Record<
  string,
  {
    title: string;
    description: string;
    stats: string;
    beneficiaries: number;
    projects: number;
    year: string;
  }
> = {
  Egypt: {
    title: "مشاريع مصر",
    description:
      "تنفيذ مشروعات صحية وتعليمية وإغاثية شاملة تهدف إلى تحسين جودة الحياة.",
    stats: "المستفيدون: 5,000 شخص",
    beneficiaries: 5000,
    projects: 12,
    year: "2025",
  },
  Palestine: {
    title: "مشاريع فلسطين",
    description:
      "دعم الأسر النازحة والمتضررة بمساعدات غذائية وطبية وتعليمية عاجلة.",
    stats: "المستفيدون: 6,000 شخص",
    beneficiaries: 6000,
    projects: 8,
    year: "2025",
  },
  "Saudi Arabia": {
    title: "مشاريع السعودية",
    description:
      "برامج تنموية مستدامة تركز على التعليم والصحة والرعاية الاجتماعية.",
    stats: "المستفيدون: 3,500 شخص",
    beneficiaries: 3500,
    projects: 15,
    year: "2025",
  },
  Iraq: {
    title: "مشاريع العراق",
    description: "إعادة بناء المجتمعات المتضررة وتوفير الخدمات الأساسية.",
    stats: "المستفيدون: 4,200 شخص",
    beneficiaries: 4200,
    projects: 10,
    year: "2025",
  },
  Syria: {
    title: "مشاريع سوريا",
    description:
      "مساعدة اللاجئين والنازحين داخلياً بالخدمات الطارئة والدعم النفسي.",
    stats: "المستفيدون: 7,800 شخص",
    beneficiaries: 7800,
    projects: 18,
    year: "2025",
  },
  Algeria: {
    title: "مشاريع الجزائر",
    description:
      "مساعدة اللاجئين والنازحين داخلياً بالخدمات الطارئة والدعم النفسي.",
    stats: "المستفيدون: 7,800 شخص",
    beneficiaries: 7800,
    projects: 18,
    year: "2025",
  },
  Morocco: {
    title: "مشاريع المغرب",
    description:
      "مساعدة اللاجئين والنازحين داخلياً بالخدمات الطارئة والدعم النفسي.",
    stats: "المستفيدون: 7,800 شخص",
    beneficiaries: 7800,
    projects: 18,
    year: "2025",
  },
  Pakistan: {
    title: "مشاريع باكستان",
    description:
      "مساعدة اللاجئين والنازحين داخلياً بالخدمات الطارئة والدعم النفسي.",
    stats: "المستفيدون: 7,800 شخص",
    beneficiaries: 7800,
    projects: 18,
    year: "2025",
  },
};

// 🎯 function عشان تمنع إنشاء style object في كل render
const getGeoStyle = (
  isActive: boolean,
  isHighlighted: boolean,
  theme: string | undefined,
  isMobile: boolean
) => ({
  default: {
    fill: isActive
      ? "#1E93AB"
      : isHighlighted
        ? "#D84040"
        : theme === "dark"
          ? "#2a2a2a"
          : "#ddd",
    stroke: theme === "dark" ? "#666" : "#999",
    strokeWidth: isMobile ? 0.3 : 0.5,
    outline: "none",
    transition: isHighlighted ? "all 0.3s ease-in-out" : "none",
  },
  hover: {
    fill: isHighlighted ? "#1E93AB" : theme === "dark" ? "#2a2a2a" : "#ddd",
    cursor: isHighlighted ? "pointer" : "default",
    outline: "none",
  },
  pressed: { outline: "none" },
});

// Loading skeleton
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
  const height = isMobile ? 200 : 450;

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

// ✅ Memoized marker
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
  Egypt: { ar: "مصر", en: "Egypt" },
  "Saudi Arabia": { ar: "السعودية", en: "Saudi Arabia" },
  Iraq: { ar: "العراق", en: "Iraq" },
  Syria: { ar: "سوريا", en: "Syria" },
  Palestine: { ar: "فلسطين", en: "Palestine" },
  Algeria: { ar: "الجزائر", en: "Algeria" },
  Morocco: { ar: "المغرب", en: "Morocco" },
  Pakistan: { ar: "باكستان", en: "Pakistan" },
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
        fontWeight="medium"
        fill={theme === "dark" ? "#f5f5f5" : "#333333"}
        stroke={theme === "dark" ? "#111" : "#000"}
        strokeWidth={0.1}
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
OptimizedMarker.displayName = "OptimizedMarker"; // ✅ حل مشكلة eslint

// const BackgroundDots = ({
//   isMobile,
//   theme,
// }: {
//   isMobile: boolean;
//   theme: string | undefined;
// }) => {
//   const dotsRef = useRef(
//     Array.from({ length: isMobile ? 200 : 400 }, (_, i) => ({
//       id: i,
//       x: Math.random() * (isMobile ? 350 : 700),
//       y: Math.random() * (isMobile ? 300 : 450),
//     }))
//   );
//   const dots = dotsRef.current;

//   return (
//     <>
//       {dots.map(({ id, x, y }) => (
//         <circle
//           key={id}
//           cx={x}
//           cy={y}
//           r={isMobile ? 1.2 : 2}
//           fill={theme === "dark" ? "#aaa" : "#444"}
//           opacity={0.25}
//         />
//       ))}
//     </>
//   );
// };

const ArabicMap = ({ params }: { params: { locale: string } }) => {
  const { locale } = params;
  const isArabic = locale === "ar";
  const { theme } = useTheme();
  const [activeCountry, setActiveCountry] = useState("Palestine");
  const [isMobile, setIsMobile] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);

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
  const [apiProjects, setApiProjects] = useState([]);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/post/project");
        const data = await res.json();
        if (data.success && data.details.length > 0) {
          // Pick 2 projects only
          setApiProjects(data.details.slice(0, 2));
          console.log(data.details);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    }
    fetchProjects();
  }, []);

  const currentProject = useMemo(
    () =>
      projectsData[activeCountry] || {
        title: activeCountry,
        description: "لا توجد تفاصيل متاحة لهذه الدولة.",
        stats: "",
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
            isArabic={isArabic} // 👈 pass it here
          />
        );
      }),
    [highlighted, activeCountry, isMobile, theme, handleCountryClick]
  );

  return (
    <div className="w-full flex flex-col items-center gap-4 px-4">
      {/* Swiper */}

      {/* Map + Card */}
      <div
        className={`w-full max-w-6xl flex ${
          isMobile ? "flex-col gap-4" : "flex-row gap-4"
        }`}
      >
        {/* Card */}
        <motion.div
          dir="rtl"
          className={`${
            isMobile ? "w-full order-2" : "w-1/3"
          } relative rounded-2xl p-[1px] bg-gradient-to-r w-fit  from-red-500 via-pink-500 to-orange-400 shadow-lg`}
        >
          <div className="bg-white h-full dark:bg-gray-900 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">
                نشط الآن
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {currentProject.year}
              </span>
            </div>

            <h2 className="text-lg font-bold text-accent-foreground dark:text-gray-100 mb-2">
              {currentProject.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {currentProject.description}
            </p>

            <h3 className="font-semibold mt-3 text-accent-foreground dark:text-gray-200">
              بعض من مشاريعنا:
            </h3>
            <div className="mt-4 flex gap-2">
              {apiProjects.map(
                (proj: { id: string; contents: { name: string }[] }) => (
                  <Link
                    key={proj.id}
                    href={`/projects/${proj.id}`}
                    className="flex-1 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-2 text-xs text-center hover:shadow-md"
                  >
                    {proj.contents[0]?.name}
                  </Link>
                )
              )}
            </div>

            <Link href={`/${locale}/projects`}>
              <div className="flex items-center gap-2 mt-4 text-xs font-medium text-red-600 dark:text-red-400 hover:underline">
                <ArrowLeftIcon className="w-4 h-4" />
                عرض الحملات
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Swiper */}
        <div
          className={`flex ${
            isMobile ? "w-full order-2" : "w-20 order-none"
          } items-center justify-center`}
        >
          <Swiper
            direction={isMobile ? "horizontal" : "vertical"}
            slidesPerView="auto"
            spaceBetween={8}
            className={`${isMobile ? "w-full" : "h-full w-20"}`}
          >
            {highlighted.map((c) => (
              <SwiperSlide key={c} style={{ height: "auto" }}>
                <button
                  onClick={() => handleCountryClick(c)}
                  className={`w-full px-2 py-2 cursor-pointer hover:bg-primary/50 rounded-lg text-xs font-semibold transition-all text-center ${
                    activeCountry === c
                      ? "bg-gradient-to-r from-red-600 to-red-500 text-white"
                      : theme === "dark"
                        ? "bg-gray-800 text-gray-200"
                        : "bg-gray-100 text-accent-foreground"
                  }`}
                >
                  {c}
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Map */}
        <div
          id="map-container"
          className={`${isMobile ? "w-full order-1" : "w-2/3 lg:w-3/4"} flex`}
        >
          <div className="w-full overflow-hidden rounded-2xl shadow-xl">
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
                    scale: isMobile ? 230 : 450,
                  }}
                  width={isMobile ? 350 : 700}
                  height={isMobile ? 200 : 450}
                  style={{
                    width: "100%",
                    height: "auto",
                    background: theme === "dark" ? "#1D1616" : "#f9f9f9",
                    borderRadius: "12px",
                  }}
                >
                  <ZoomableGroup
                    center={[30, 25]}
                    zoom={1}
                    translateExtent={
                      isMobile
                        ? [
                            [0, 0],
                            [350, 300],
                          ]
                        : [
                            [0, 0],
                            [700, 450],
                          ]
                    }
                  >
                    {/* <BackgroundDots isMobile={isMobile} theme={theme} /> */}
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
                  </ZoomableGroup>
                </ComposableMap>
              </Suspense>
            ) : (
              <MapLoading isArabic={isArabic} isMobile={isMobile} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArabicMap;
