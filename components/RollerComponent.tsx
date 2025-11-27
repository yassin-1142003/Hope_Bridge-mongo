"use client";
import dynamic from "next/dynamic";
import React from "react";

const RollerComponent = () => {
  // ✅ Use dynamic import with loading state instead of lazy
  const RollingGallery = dynamic(() => import("./RollingGallery"), {
    loading: () => (
      <div className="relative overflow-hidden h-[280px] md:h-[320px] w-full">
        <div className="h-full w-full bg-gray-200 animate-pulse rounded-lg" />
      </div>
    ),
    ssr: false,
  });
  return (
    <div className="w-full h-full">
      <RollingGallery
        autoplay={true}
        pauseOnHover={false}
        speed={40}
        cardGap={0.85}
        cardWidth={{ small: 460, large: 340 }}
        cardHeight={{ small: 500, large: 430 }}
      />
    </div>
  );
};

export default RollerComponent;
