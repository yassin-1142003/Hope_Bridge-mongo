"use client";
import React, { ReactNode } from "react";
import { useTheme } from "next-themes"; // install: npm i next-themes

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  darkColors?: string[]; // 🌙 Dark mode colors
  animationSpeed?: number;
  showBorder?: boolean;
}

export default function GradientText({
  children,
  className = "",
  colors = ["#40ffaa", "#4079ff", "#40ffaa"],
  darkColors = ["#d23e3e", "#d84040", "#ECDFCC"], // default for dark
  animationSpeed = 8,
  showBorder = false,
}: GradientTextProps) {
  const { theme } = useTheme(); // "light" | "dark" | "system"

  const appliedColors = theme !== "light" ? darkColors : colors;

  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${appliedColors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  return (
    <div className={`flexr text-lg my-1 items-center ${className}`}>
      {showBorder && (
        <div className="gradient-overlay" style={gradientStyle}></div>
      )}
      <h1
        className="text-content line-clamp-1 font-almarai font-extrabold"
        style={gradientStyle}
      >
        {children}
      </h1>
    </div>
  );
}
