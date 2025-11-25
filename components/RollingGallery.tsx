"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import Image from "next/image";
const IMGS = [
  "/homepage/01.webp",
  "/homepage/02.webp",
  "/homepage/03.webp",
  "/homepage/04.webp",
  "/homepage/05.webp",
  "/homepage/06.webp",
  "/homepage/07.webp",
  "/homepage/08.webp",
  "/homepage/09.webp",
  "/homepage/10.webp",
];

interface RollingGalleryProps {
  autoplay?: boolean; // Enables automatic spinning
  pauseOnHover?: boolean; // Pauses spinning when hovered
  speed?: number; // Controls spin speed (seconds per full 360° revolution)
  images?: string[]; // Custom images array

  // New advanced card configuration props
  cardWidth?: {
    small: number; // Card width for small screens (px)
    large: number; // Card width for large screens (px)
  };
  cardHeight?: {
    small: number; // Card height for small screens (px)
    large: number; // Card height for large screens (px)
  };
  cardGap?: number; // Gap between cards (0-1, where 0 = no gap, 1 = maximum gap)
}

export default function RollingGallery({
  autoplay = false,
  pauseOnHover = false,
  speed = 60, // Default = 60 sec per full rotation (slower spin)
  images = [],

  // Default card configuration
  cardWidth = { small: 900, large: 400 },
  cardHeight = { small: 900, large: 500 },
  cardGap = 0.9, // Default gap (0.3 = 30% spacing between cards)
}: RollingGalleryProps) {
  // Use provided images or default list
  const galleryImages = images.length > 0 ? images : IMGS;

  // Track if screen size is small (affects sizes)
  const [isSmall, setIsSmall] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Delay rendering by 200ms
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkScreen = () => setIsSmall(window.innerWidth <= 480);
    checkScreen(); // run once on mount
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);
  /** ===== LAYOUT VARIABLES ===== **/

  const cylinderWidth = isSmall ? 2500 : 2500;
  // Width of the entire "circle" — larger value = more spread-out cards

  const radius = isSmall
    ? cylinderWidth / (0.6 * Math.PI)
    : cylinderWidth / (1 * Math.PI);
  // Radius of the cylinder — controls curve depth

  const faceCount = galleryImages.length * 1;
  // Total cards/images in the circle

  // Calculate card spacing based on cardGap prop
  // cardGap: 0 = tight spacing, 1 = maximum spacing
  const gapMultiplier = Math.max(0.1, Math.min(1, 0.1 + cardGap * 0.9));
  const faceWidth = (cylinderWidth / faceCount) * gapMultiplier;
  // Width of each card container — controlled by cardGap prop

  // Get current card dimensions based on screen size
  const currentCardWidth = isSmall ? cardWidth.small : cardWidth.large;
  const currentCardHeight = isSmall ? cardHeight.small : cardHeight.large;

  /** ===== MOTION VARIABLES ===== **/

  const rotation = useMotionValue(0); // Current Y-axis rotation angle
  const transform = useTransform(rotation, (val) => `rotateY(${val}deg)`);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const velocityRef = useRef<number>(0); // Degrees per second — affects spin speed
  const spinningRef = useRef<boolean>(false);
  const pausedRef = useRef<boolean>(false);

  /** ===== AUTOPLAY LOOP ===== **/

  const startSpinning = () => {
    spinningRef.current = true;
    lastTimeRef.current = performance.now();
    loop();
  };

  const stopSpinning = () => {
    spinningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const loop = () => {
    if (!spinningRef.current) return;

    const now = performance.now();
    const delta = (now - lastTimeRef.current) / 1000; // Time since last frame in seconds
    lastTimeRef.current = now;

    if (!pausedRef.current) {
      const targetVelocity = 360 / speed;
      // Converts `speed` (seconds per revolution) → degrees/sec
      // Smaller `speed` = faster rotation
      velocityRef.current += (targetVelocity - velocityRef.current) * 0.05;
      // Smoothly approaches target speed
      rotation.set(rotation.get() + velocityRef.current * delta);
    }

    rafRef.current = requestAnimationFrame(loop);
  };

  /** ===== DRAG CONTROLS ===== **/

  const handleDrag = (_: MouseEvent, info: PanInfo) => {
    stopSpinning(); // Stop autoplay while dragging
    rotation.set(rotation.get() - info.delta.x * 0.1);
    // Drag sensitivity (0.1 = medium)
    velocityRef.current = -info.velocity.x * 0.1;
    // Sets spin speed after releasing drag
  };

  const handleDragEnd = () => {
    if (autoplay) startSpinning(); // Resume autoplay
  };

  /** ===== HOVER CONTROLS ===== **/

  const handleMouseEnter = () => {
    if (autoplay && pauseOnHover) pausedRef.current = true;
  };

  const handleMouseLeave = () => {
    if (autoplay && pauseOnHover) pausedRef.current = false;
  };

  /** ===== AUTOSTART ===== **/

  useEffect(() => {
    if (autoplay) startSpinning();
    return () => stopSpinning();
  }, [autoplay, speed]);

  if (!mounted) {
    // Skeleton or hidden state
    return (
      <div className="relative overflow-hidden py-5 md:py-36">
        <div className="h-[300px] w-full bg-gray-600 animate-pulse rounded-lg" />
      </div>
    );
  }
  return (
    <div className="relative  overflow-hidden   md:py-36 ">
      <div
        className="flex h-full w-fit items-center justify-center [transform-style:preserve-3d ]"
        style={{ perspective: isSmall ? 300 : 2000 }} // Depth of 3D perspective
      >
        <motion.div
          drag="x"
          dragElastic={0}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: transform,
            rotateY: rotation,
            width: cylinderWidth, // Controls total width of the 3D carousel
            transformStyle: "preserve-3d",
          }}
          className="flex min-h-[300px] cursor-grab items-center justify-center [transform-style:preserve-3d]"
        >
          {galleryImages.map((url, i) => (
            <div
              key={i}
              className="group absolute flex  items-center justify-center [backface-visibility:hidden]"
              style={{
                width: `${faceWidth * 2.8}px`,
                // Card container width — controlled by cardGap
                transform: `rotateY(${
                  (360 / faceCount) * i + 480
                }deg) translateZ(-${radius}px)`,
                // Places cards around the cylinder
              }}
            >
              <Image
                priority
                fetchPriority="high"
                src={url}
                alt="gallery"
                width={currentCardWidth}
                height={currentCardHeight}
                style={{
                  width: `${currentCardWidth}px`,
                  height: `${currentCardHeight}px`,
                }}
                className="pointer-events-none rounded-xl  bg-white shadow-lg object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
