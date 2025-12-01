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
  User,
  LogOut,
  Settings,
  ChevronDown,
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
import { useAuth } from "@/hooks/useAuth";
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
import AlertButton from "@/components/AlertButton";
>>>>>>> Stashed changes
=======
import AlertButton from "@/components/AlertButton";
>>>>>>> Stashed changes
=======
import AlertButton from "@/components/AlertButton";
>>>>>>> Stashed changes
=======
import AlertButton from "@/components/AlertButton";
>>>>>>> Stashed changes
=======
import AlertButton from "@/components/AlertButton";
>>>>>>> Stashed changes
=======
import AlertButton from "@/components/AlertButton";
>>>>>>> Stashed changes
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [donationopen, setdonationopen] = useState(false);
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const isArabic = locale === "ar";
  const t = useTranslations("header");
  const pwa = usePWA();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = useMemo(
    () =>
      !user || user.role === "USER"
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
    [user, t]
  );

  return (
    <header className="fixed top-0 z-50 w-full bg-background/80 dark:bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-border/50">
      <div className="mx-auto flex max-w-screen-xl items-center px-4 h-16 justify-between">
        {/* Logo */}
        <Link
          href={`/${locale}/`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
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
        <nav
          className={`hidden lg:flex items-center gap-1 ${isArabic ? "flex-row-reverse" : "flex-row"}`}
        >
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
          {/* Alert Button */}
          <AlertButton locale={locale} />
          {/* <Button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded    cursor-pointer bg-background border border-primary/30 dark:bg-[#1d1616]"
          >
            {theme === "dark" ? "🌙 " : "☀️ "}
          </Button> */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-9 px-3 rounded-lg hover:bg-accent/50 transition-all duration-200 group"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/avatar-placeholder.webp" alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:block">
                    {user.name}
                  </span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar-placeholder.webp" alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>{isArabic ? "الملف الشخصي" : "Profile"}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/settings`} className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    <span>{isArabic ? "الإعدادات" : "Settings"}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isArabic ? "تسجيل الخروج" : "Logout"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href={`/${locale}/signin`}>
              <Button
                className="
        group flex items-center gap-2 
        px-4 py-2 rounded-md
        bg-primary cursor-pointer
        hover:bg-primary/90 transition-all
        shadow-sm hover:shadow-md
      "
              >
                <LogIn
                  className="
          w-5 h-5 transition-transform 
          group-hover:-translate-x-1
        "
                />
                <span className="font-medium">
                  {isArabic ? "تسجيل الدخول" : "Login"}
                </span>
              </Button>
            </Link>
          )}
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
                    <span className="font-bold text-primary text-lg">
                      Hope Bridge
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isArabic ? "جسر الأمل" : "Bridge of Hope"}
                    </span>
                  </div>
                </Link>
                {user ? (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/avatar-placeholder.webp" alt={user.name} />
                      <AvatarFallback className="bg-primary/20 text-primary font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <Link href={`/${locale}/signin`}>
                    <Button className="w-full bg-gradient-to-r from-primary mb-2 to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl text-base font-bold py-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                      <LogIn
                        className="
            w-5 h-5 transition-transform 
            group-hover:-translate-x-1
          "
                      />
                      <span className="font-medium">
                        {isArabic ? "تسجيل الدخول" : "Login"}
                      </span>
                    </Button>
                  </Link>
                )}
                {pwa && !pwa.isStandalone && (
                  <Button
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-accent/50 transition-all duration-200"
                  >
                    <span className="text-base">
                      {theme === "dark" ? "🌙" : "☀️"}
                    </span>
                  </Button>
                )}
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
                        <div
                          className={`relative p-1.5 rounded-lg transition-all duration-200 ${
                            pathname === href
                              ? "bg-primary/20 text-primary"
                              : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                          }`}
                        >
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
                  <Link
                    href={`/${locale}/donate`}
                    onClick={() => setOpen(false)}
                  >
                    <Button className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary/85 transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl border border-primary/20">
                      <span className="text-sm font-bold">{t("donate")}</span>
                    </Button>
                  </Link>
                  {user ? (
                    <>
                      <Link
                        href={`/${locale}/dashboard`}
                        onClick={() => setOpen(false)}
                      >
                        <Button
                          variant="outline"
                          className="w-full h-11 rounded-xl font-medium border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-[1.02] group"
                        >
                          <User
                            size={16}
                            className="mr-2 text-primary group-hover:scale-110 transition-transform duration-200"
                          />
                          <span className="font-medium">
                            {isArabic ? "الملف الشخصي" : "Profile"}
                          </span>
                        </Button>
                      </Link>
                      <Button
                        onClick={() => {
                          logout();
                          setOpen(false);
                        }}
                        variant="outline"
                        className="w-full h-11 rounded-xl font-medium border-red-300 hover:border-red-400 hover:bg-red-50 transition-all duration-200 hover:scale-[1.02] group text-red-600"
                      >
                        <LogOut
                          size={16}
                          className="mr-2 text-red-600 group-hover:scale-110 transition-transform duration-200"
                        />
                        <span className="font-medium">
                          {isArabic ? "تسجيل الخروج" : "Logout"}
                        </span>
                      </Button>
                    </>
                  ) : (
                    <Link
                      href={`/${locale}/signin`}
                      onClick={() => setOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-11 rounded-xl font-medium border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-[1.02] group"
                      >
                        <LogIn
                          size={16}
                          className="mr-2 text-primary group-hover:scale-110 transition-transform duration-200"
                        />
                        <span className="font-medium">
                          {isArabic ? "دخول" : "Login"}
                        </span>
                      </Button>
                    </Link>
                  )}
                  {pwa && !pwa.isStandalone && (
                    <Button
                      onClick={() => {
                        pwa.triggerInstall();
                        setOpen(false);
                      }}
                      variant="outline"
                      className="w-full h-11 rounded-xl font-medium border-amber-400/50 hover:border-amber-400 hover:bg-amber-400/5 transition-all duration-200 hover:scale-[1.02] group"
                    >
                      <Download
                        size={16}
                        className="mr-2 text-amber-500 group-hover:scale-110 transition-transform duration-200"
                      />
                      <span className="font-medium">
                        {isArabic ? "تثبيت" : "Install App"}
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
