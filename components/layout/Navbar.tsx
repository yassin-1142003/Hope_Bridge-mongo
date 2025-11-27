"use client";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  Home,
  Info,
  LogIn,
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
    <header className="fixed top-0 z-50 w-full bg-background/80 dark:bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-border/50">
      <div className="mx-auto flex max-w-screen-xl items-center px-4 h-16 justify-between">
        {/* Logo */}
        <Link href={`/${locale}/`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            className="w-15 h-15 object-contain"
            src="/logo.webp"
            alt="Logo"
            width={100}
            height={100}
          />
          {/* <span className="text-lg font-bold text-primary hidden sm:block">Hope Bridge</span> */}
        </Link>

        {/* Desktop Nav */}
        <nav className={`hidden lg:flex items-center gap-1 ${isArabic ? "flex-row-reverse" : "flex-row"}`}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <LanguageSwitcher />
          <Button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg hover:bg-accent/50 transition-all duration-200"
          >
            <span className="text-base">{theme === "dark" ? "🌙" : "☀️"}</span>
          </Button>
          <Link href={`/${locale}/donate`}>
            <Button 
              size="sm" 
              className="h-9 px-4 rounded-lg font-medium bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
            >
              <span className="font-semibold">{t("donate")}</span>
            </Button>
          </Link>
          {pwa && !pwa.isStandalone && (
            <Button
              onClick={pwa.triggerInstall}
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-lg border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-105"
            >
              <Download size={14} className="text-primary" />
            </Button>
          )}
          <Link href={`/${locale}/signin`}>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-4 rounded-lg font-medium border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-105"
            >
              <LogIn size={14} className="mr-2 text-primary" />
              <span className="font-medium">{isArabic ? "دخول" : "Login"}</span>
            </Button>
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="lg:hidden flex items-center gap-2">
          <Button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-accent/50 transition-all duration-200"
          >
            <span className="text-sm">{theme === "dark" ? "🌙" : "☀️"}</span>
          </Button>
          <Link href={`/${locale}/donate`}>
            <Button 
              size="sm" 
              className="h-8 px-3 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
            >
              {t("donate")}
            </Button>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg hover:bg-accent/50 transition-all duration-200"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              dir={isArabic ? "rtl" : "ltr"}
              className="w-80 flex flex-col bg-background/95 backdrop-blur-xl border-l border-border/20 shadow-2xl"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/10 bg-gradient-to-r from-background/50 to-background/30">
                <Link
                  href={`/${locale}/`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 group"
                >
                  <div className="relative">
                    <Image
                      className="w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-110"
                      src="/logo.webp"
                      alt="Logo"
                      width={32}
                      height={32}
                    />
                    <div className="absolute -inset-1 bg-primary/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-primary text-lg">Hope Bridge</span>
                    <span className="text-xs text-muted-foreground">{isArabic ? "جسر الأمل" : "Bridge of Hope"}</span>
                  </div>
                </Link>
                <div className="flex items-center gap-1">
                  <LanguageSwitcher />
                  <Button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-accent/50 transition-all duration-200"
                  >
                    <span className="text-base">{theme === "dark" ? "🌙" : "☀️"}</span>
                  </Button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 py-2">
                <div className="px-3 mb-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isArabic ? "القائمة" : "Navigation"}
                  </p>
                </div>
                <nav className="space-y-1 px-2">
                  {navLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                        pathname === href
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                    >
                      <div className={`relative p-1.5 rounded-lg transition-all duration-200 ${
                        pathname === href 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{label}</span>
                      {pathname === href && (
                        <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                      )}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Action Buttons */}
              <div className="p-4 space-y-3 border-t border-border/10 bg-gradient-to-b from-background/30 to-background/50">
                <div className="px-3 mb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isArabic ? "إجراءات" : "Actions"}
                  </p>
                </div>
                <Link href={`/${locale}/donate`} onClick={() => setOpen(false)}>
                  <Button 
                    className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary/85 transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl border border-primary/20"
                  >
                    <span className="text-sm font-bold">{t("donate")}</span>
                  </Button>
                </Link>
                <Link href={`/${locale}/signin`} onClick={() => setOpen(false)}>
                  <Button 
                    variant="outline" 
                    className="w-full h-11 rounded-xl font-medium border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-[1.02] group"
                  >
                    <LogIn size={16} className="mr-2 text-primary group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">{isArabic ? "دخول" : "Login"}</span>
                  </Button>
                </Link>
                {pwa && !pwa.isStandalone && (
                  <Button
                    onClick={() => {
                      pwa.triggerInstall();
                      setOpen(false);
                    }}
                    variant="outline"
                    className="w-full h-11 rounded-xl font-medium border-amber-400/50 hover:border-amber-400 hover:bg-amber-400/5 transition-all duration-200 hover:scale-[1.02] group"
                  >
                    <Download size={16} className="mr-2 text-amber-500 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">{isArabic ? "تثبيت" : "Install App"}</span>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
