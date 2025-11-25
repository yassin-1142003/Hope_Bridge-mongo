"use client";

import { useEffect } from "react";
import Script from "next/script";

interface DonorboxWidgetStyledProps {
  campaignId?: string;
  title?: string;
  description?: string;
}

export function DonorboxWidgetStyled({
  campaignId = "donate-823324",
}: DonorboxWidgetStyledProps) {
  return (
    <div className="w-full bg-none max-w-2xl mx-auto">
      {/* Load Donorbox script */}
      <Script src="https://donorbox.org/widget.js" strategy="lazyOnload" />

      {/* Elegant container with gradient */}
      <div className="relative group">
        {/* Gradient glow effect */}

        {/* Main card */}
        {/* Header section */}

        {/* Donorbox iframe container */}

        <iframe
          src={`https://donorbox.org/embed/${campaignId}?`}
          name="donorbox"
          allowFullScreen
          seamless
          className="w-full border-0 rounded-lg shadow-inner"
          style={{
            maxWidth: "100%",
            minWidth: "250px",
            height: "900px",
            maxHeight: "none",
          }}
          allow="payment"
        />
      </div>
    </div>
  );
}
