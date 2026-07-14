"use client";

import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  fallback: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}

export function SafeImage({
  src,
  alt,
  fallback,
  className = "",
  width,
  height,
  fill,
}: SafeImageProps) {
  // Track which src failed — derive display URL so prop changes always show the new image.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const currentSrc = failedSrc === src ? fallback : src;

  const handleError = () => {
    setFailedSrc(src);
  };

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        onError={handleError}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  );
}
