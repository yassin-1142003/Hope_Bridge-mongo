"use client";
import { getTranslations } from "next-intl/server";
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
          className=" w-28 md:w-40  lg:w-52 bg-primary cursor-pointer  text-md py-4 px-3 md:px-6 md:py-7 md:text-2xl  border md:border-2 border-primary text-background duration-300 transition ease-in-out hover:text-primary hover:bg-background font-bold self-center rounded-xs"
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
