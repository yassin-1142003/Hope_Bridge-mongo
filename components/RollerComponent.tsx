"use client";
import dynamic from "next/dynamic";
import React from "react";

const RollerComponent = () => {
  // ✅ Use dynamic import with loading state instead of lazy
  const RollingGallery = dynamic(() => import("./RollingGallery"), {
    loading: () => (
      <div className="relative overflow-hidden py-5 md:py-36">
        <div className="h-[300px] w-full bg-gray-200 animate-pulse rounded-lg" />
      </div>
    ),
    ssr: false,
  });
  return (
    <div>
      <RollingGallery
        autoplay={true}
        pauseOnHover={false}
        speed={40}
        cardGap={0.85}
      />
    </div>
  );
};

export default RollerComponent;
