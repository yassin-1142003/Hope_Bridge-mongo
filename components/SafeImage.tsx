"use client";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

const SafeImage = (props: ImageProps) => {
  const [error, setError] = useState(false);

  // Convert external URLs to API URLs
  const getApiUrl = (src: string) => {
    // If it's already an API URL, return as is
    if (src.includes('/api/media/')) {
      return src;
    }
    
    // If it's a local path starting with /, convert to API URL
    if (src.startsWith('/')) {
      return `/api/media${src}`;
    }
    
    // If it's an external URL (Unsplash, etc.), use fallback
    if (src.startsWith('http')) {
      return '/api/media/homepage/01.webp'; // Use local fallback
    }
    
    // Default case
    return `/api/media/${src}`;
  };

  const apiSrc = getApiUrl(props.src as string);

  return (
    <Image
      {...props}
      src={error ? "/api/media/homepage/01.webp" : apiSrc}
      onError={() => setError(true)}
      alt={props.alt || "Project Image"}
      // Responsive control 👇
      width={340}
      height={190}
      loading="lazy"
      className={`object-cover h-[200px] w-full transition-transform duration-700 group-hover:scale-105 ${
        props.className || ""
      }`}
    />
  );
};

export default SafeImage;
