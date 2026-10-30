"use client";

import React, { useState } from "react";
import { getCountryCode } from "@/types/family";

interface CountryFlagProps {
  country?: string;
  className?: string;
  title?: string;
}

export default function CountryFlag({
  country,
  className = "w-4.5 h-3.5",
  title,
}: CountryFlagProps) {
  const code = getCountryCode(country);
  const displayTitle = title || country || "Bangladesh";
  const [hasError, setHasError] = useState(false);

  // Dynamic basePath resolution for GitHub Pages vs Localhost
  const basePath =
    typeof window !== "undefined" && window.location.pathname.startsWith("/bongsho-brikkho")
      ? "/bongsho-brikkho"
      : process.env.NODE_ENV === "production"
      ? "/bongsho-brikkho"
      : "";

  const src = hasError ? `https://flagcdn.com/${code}.svg` : `${basePath}/flags/${code}.svg`;

  return (
    <img
      src={src}
      alt={displayTitle}
      title={displayTitle}
      onError={() => {
        if (!hasError) setHasError(true);
      }}
      className={`inline-block object-cover rounded-[2px] shadow-xs border border-black/15 flex-shrink-0 align-middle ${className}`}
    />
  );
}

