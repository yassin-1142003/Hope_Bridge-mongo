"use client";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  Home,
  Info,
  Menu,
  Newspaper,
  Speech,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import LanguageSwitcher from "../LanguageSwitcher";
import Link from "next/link";
import { useTheme } from "next-themes";
import Image from "next/image";
import DonationModal from "../DonationModal";
import { usePWA } from "@/components/PWAContext";
import { Download } from "lucide-react";

type HeaderProps = {
  session: { user?: { role?: string } } | null;
};

export default function Header({ session }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [donationopen, setdonationopen] = useState(false);
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const isArabic = locale === "ar";
  const t = useTranslations("header");
  const pwa = usePWA();

  const navLinks = useMemo(
    () =>
      !session || session.user?.role === "user"
        ? [
            { label: t("home"), href: `/${locale}`, icon: Home },
            { label: t("about"), href: `/${locale}/about`, icon: Info },
            {
              label: t("projects"),
              href: `/${locale}/projects`,
              icon: FolderKanban,
            },
            { label: t("contact"), href: `/${locale}/contact`, icon: Speech },
            // { label: t("news"), href: `/${locale}/news`, icon: Newspaper },
          ]
        : [
            { label: t("home"), href: `/${locale}`, icon: Home },
            { label: t("about"), href: `/${locale}/about`, icon: Info },
            {
              label: t("projects"),
              href: `/${locale}/projects`,
              icon: FolderKanban,
            },
            { label: t("contact"), href: `/${locale}/contact`, icon: Speech },
            // { label: t("news"), href: `/${locale}/news`, icon: Newspaper },
            {
              label: t("dashboard"),
              href: `/${locale}/dashboard`,
              icon: Newspaper,
            },
          ],
    [session, t]
  );

  return (
    <header className="fixed top-0 z-50 w-full bg-background/70 dark:bg-[#121212]/70 backdrop-blur-sm shadow-sm">
      {/* <DonationModal
        isOpen={donationopen}
        onClose={() => setdonationopen(!donationopen)}
        locale={locale}
      /> */}

      <div className="mx-auto flex max-w-screen-xl items-center p-2 justify-between ">
        {/* Logo */}
        <Link href={`/${locale}/`} className="text-xl font-bold text-primary">
          <Image
            className="w-20 h-20 object-cover"
            src="/logo.webp"
            alt="Logo"
            width={100}
            height={100}
          />
        </Link>

        {/* Desktop Nav */}
        <nav
          className={`hidden md:flex items-center gap-6 ${
            isArabic ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {navLinks.map((link) => (
            <div key={link.href}>
              <Link
                href={link.href}
                className={`font-semibold transition ${
                  pathname === link.href
                    ? "text-primary font-bold"
                    : "text-accent-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            </div>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-6">
          <LanguageSwitcher />
          <Link href={`/${locale}/donate`}>
            <Button
              // onClick={() => setdonationopen(!donationopen)}
              className="rounded-[3px] cursor-pointer font-semibold shadow-md"
            >
              {t("donate")}
            </Button>
          </Link>
          {pwa && !pwa.isStandalone && (
            <Button
              onClick={pwa.triggerInstall}
              className="rounded-[3px] cursor-pointer font-semibold shadow-md bg-primary text-white flex items-center gap-2"
            >
              <Download size={16} />{" "}
            </Button>
          )}
          <Button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded    cursor-pointer bg-background border border-primary/30 dark:bg-[#1d1616]"
          >
            {theme === "dark" ? "🌙 " : "☀️ "}
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden  flex items-center gap-3">
          {/* Donate Button - Modern Gradient Style */}
          <Button
            // onClick={() => setdonationopen(!donationopen)}
            className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            asChild
          >
            <Link href={`/${locale}/donate`}>
              <span className="relative z-10">{t("donate")}</span>
            </Link>
          </Button>

          {/* Menu Sheet */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Toggle menu"
                className="relative p-2.5 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-md group"
              >
                <Menu
                  className={`h-6 w-6 transition-all duration-300 ${
                    open
                      ? "rotate-90 text-primary"
                      : "text-foreground group-hover:text-primary"
                  }`}
                />
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              dir={isArabic ? "rtl" : "ltr"}
              className="flex w-72 sm:w-80 flex-col gap-6 py-6 bg-background/95 backdrop-blur-md  dark:bg-gradient-to-b dark:from-[#1a1a1a] dark:to-[#2a2a2a] border-l border-border/50"
            >
              {/* Mobile Logo */}
              <Link
                href={`/${locale}/`}
                onClick={() => setOpen(false)}
                className="px-6 text-xl font-bold text-primary hover:opacity-80 transition-opacity"
              >
                {/* Logo component here */}
              </Link>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-2 px-4">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      pathname === href
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-foreground hover:bg-accent hover:text-primary"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-transform duration-200 ${
                        pathname === href ? "scale-110" : ""
                      }`}
                    />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>

              {/* Action Buttons */}

              <div className="px-6 space-y-3">
                <Link href={`/${locale}/donate`}>
                  <Button
                    // asChild
                    // onClick={() => setdonationopen(!donationopen)}
                    className="w-full bg-gradient-to-r from-primary mb-2 to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl text-base font-bold py-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    {t("donate")}
                  </Button>
                </Link>

                {pwa && !pwa.isStandalone && (
                  <Button
                    onClick={pwa.triggerInstall}
                    variant="outline"
                    className="w-full border-2  border-amber-400 dark:border-amber-500  dark:bg-amber-400/10  hover:bg-amber-400/10 rounded-xl text-base font-bold py-6 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <Download size={16} />{" "}
                    {isArabic ? "تثبيت التطبيق" : "Install App"}
                  </Button>
                )}
              </div>

              {/* Footer Controls */}
              <div className="mt-auto flex items-center justify-center gap-4 border-t border-border/50 pt-6 px-6">
                <LanguageSwitcher />
                <Button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border-2 hover:scale-110 transition-transform duration-200"
                >
                  {theme === "dark" ? "🌙" : "☀️"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
