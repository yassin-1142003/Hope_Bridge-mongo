"use client";
import React, { useState } from "react";
import DonationModal from "./DonationModal";
import { Button } from "./ui/button";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

const HeroDonate = () => {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const isArabic = locale === "ar";

  const [donationopen, setdonationopen] = useState(false);
  return (
    <div>
      <Link href={`/${locale}/donate`}>
        <Button
          // onClick={() => setdonationopen(!donationopen)}
          className="w-24 md:w-32 lg:w-40 h-12 md:h-14 bg-background cursor-pointer text-sm md:text-base lg:text-lg px-4 md:px-6 border-2 border-primary text-primary duration-300 transition ease-in-out hover:text-background hover:bg-primary font-bold rounded-lg shadow-sm hover:shadow-md"
        >
          {t("donate")}
        </Button>
        <DonationModal
          isOpen={donationopen}
          onClose={() => setdonationopen(!donationopen)}
          locale={locale}
        />
      </Link>
    </div>
  );
};

export default HeroDonate;
