"use client";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

const SafeImage = (props: ImageProps) => {
  const [error, setError] = useState(false);

  return (
    <Image
      {...props}
      src={error ? "https://placehold.net/default.svg" : props.src}
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
