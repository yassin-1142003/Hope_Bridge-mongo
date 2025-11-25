// DonationModalWrapper.tsx
"use client";
import { useState } from "react";
import DonationModal from "./DonationModal";
import { Button } from "./ui/button";

export default function DonationModalWrapper({ locale }: { locale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const isArabic = locale === "ar";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 🧠 Stop <Link> from triggering
    e.preventDefault(); // 🧠 Prevent navigation
    setIsOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        className=" cursor-pointer w-24 text-white font-bold px-6 py-2 rounded-md shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        {isArabic ? "تبرع" : "Donate"}
      </Button>

      <DonationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        locale={locale}
      />
    </>
  );
}
