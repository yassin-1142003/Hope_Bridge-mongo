import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  X,
  ArrowUpRight,
  Heart,
} from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";

export default function Footer() {
  const locale = useLocale();
  const isArabic = locale === "ar";

  const navItems = [
    {
      titleEn: "About",
      titleAr: "من نحن",
      href: `/${locale}/about`,
    },
    {
      titleEn: "Projects",
      titleAr: "المشاريع",
      href: `/${locale}/projects`,
    },
    {
      titleEn: "Contact",
      titleAr: "اتصل بنا",
      href: `/${locale}/contact`,
    },
    {
      titleEn: "Donate",
      titleAr: "تبرع",
      href: `/${locale}/donate`,
    },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      href: "https://www.facebook.com/HopeCharityBridge",
      icon: Facebook,
      ariaLabel: isArabic ? "فيسبوك" : "Facebook",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/hope_bridge_hba",
      icon: Instagram,
      ariaLabel: isArabic ? "انستغرام" : "Instagram",
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@hopebridgecharity",
      icon: null,
      ariaLabel: isArabic ? "تيك توك" : "TikTok",
    },
    {
      name: "X",
      href: "https://x.com/HopeBridge_HBA",
      icon: X,
      ariaLabel: isArabic ? "إكس (تويتر)" : "X (Twitter)",
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/hopebridge-association",
      icon: Linkedin,
      ariaLabel: isArabic ? "لينكد إن" : "LinkedIn",
    },
  ];

  const contactInfo = [
    {
      icon: Mail,
      text: "contact@hopebridgecharity.com",
      href: "mailto:contact@hopebridgecharity.com",
      ariaLabel: isArabic ? "البريد الإلكتروني" : "Email",
    },
    {
      icon: Phone,
      text: "+20 1022409148",
      href: "tel:+201022409148",
      ariaLabel: isArabic ? "الهاتف" : "Phone",
    },
    {
      icon: MapPin,
      text: isArabic ? "غزة، فلسطين" : "Gaza, Palestine",
      href: "https://maps.google.com/?q=Gaza,Palestine",
      ariaLabel: isArabic ? "الموقع" : "Location",
    },
  ];

  const t = (en: string, ar: string) => (isArabic ? ar : en);

  return (
    <footer
      className="relative overflow-hidden text-gray-800 dark:text-gray-100 transition-colors duration-700"
      role="contentinfo"
      aria-label={t("Footer", "تذييل الصفحة")}
    >
      {/* Decorative particles */}
      <div aria-hidden="true">
        {[...Array(25)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-primary dark:bg-white rounded-full opacity-70 animate-sprinkle pointer-events-none"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 10}s`,
            }}
          />
        ))}

        {[...Array(6)].map((_, i) => (
          <div
            key={`meteor-${i}`}
            className="absolute w-[2px] bg-primary dark:bg-white h-[2px] rounded-full opacity-0 animate-meteor pointer-events-none"
            style={{
              top: `${Math.random() * 50}%`,
              left: `-10%`,
              animationDelay: `${i * 3 + Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            <div className="absolute top-0 left-0 w-16 h-px bg-linear-to-r from-transparent via-primary to-transparent dark:from-transparent dark:via-white dark:to-transparent opacity-70 -translate-x-full" />
          </div>
        ))}

        <div className="absolute top-10 left-10 w-64 h-64 bg-linear-to-br from-[#ffadad]/20 to-[#ff7070]/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-linear-to-tl from-[#ffb6b6]/20 to-[#d23e3e]/10 rounded-full blur-3xl animate-pulse-glow delay-1000" />
      </div>

      <div
        dir={isArabic ? "rtl" : "ltr"}
        className="relative z-10 w-full overflow-hidden max-w-screen-xl mx-auto px-6 pb-2 pt-12"
      >
        <div className="bg-[#b73636]/95 dark:bg-gray-900 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/30 dark:border-gray-700/50 p-8 md:p-12 transition-all duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* About Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
                {t("Hope Bridge", "جسر الأمل")}
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                {t(
                  "Empowering communities through sustainable development and humanitarian aid.",
                  "تمكين المجتمعات من خلال التنمية المستدامة والمساعدات الإنسانية."
                )}
              </p>
              <Link
                href={`/${locale}/donate`}
                className="inline-flex bg-[#f5f5f5]  text-primary  items-center gap-2 px-4 py-2  font-semibold rounded-full shadow-lg hover:opacity-90 transition-all duration-300 mt-4"
              >
                <Heart className="w-4 h-4 fill-white" />
                {t("Donate Now", "تبرع الآن")}
              </Link>
              {/* Social Media Links */}
              <nav
                aria-label={t(
                  "Social media links",
                  "روابط وسائل التواصل الاجتماعي"
                )}
              >
                <div className="flex gap-3 mt-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      className="p-2.5 rounded-full  text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-[#d23e3e]/20 hover:border-[#d23e3e]/50 hover:scale-110 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      {social.icon ? (
                        <social.icon className="w-5 h-5" />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="w-5 h-5"
                        >
                          <path d="M12.9 2c.3 2.2 1.8 3.9 3.8 4.4v2.4c-1.1 0-2.2-.3-3.2-.9v7.4a5.3 5.3 0 1 1-5.3-5.3c.4 0 .8 0 1.1.1v2.5a2.7 2.7 0 1 0 1.9 2.6V2h1.7z" />
                        </svg>
                      )}
                    </a>
                  ))}
                </div>
              </nav>
            </div>

            {/* Quick Links Section */}
            <nav aria-label={t("Quick links", "روابط سريعة")}>
              <h3 className="font-semibold mb-4 text-lg text-white">
                {t("Quick Links", "روابط سريعة")}
              </h3>
              <ul className="space-y-2 text-sm font-medium text-white/80">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      target="_blank"
                      href={item.href}
                      className="hover:text-white dark:hover:text-[#d23e3e] transition-colors duration-200 inline-flex items-center gap-1 group"
                    >
                      {isArabic ? item.titleAr : item.titleEn}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Contact Section */}
            <div>
              <h3 className="font-semibold mb-4 text-lg text-white">
                {t("Contact Us", "اتصل بنا")}
              </h3>
              <address className="not-italic">
                <ul className="space-y-3 text-sm text-white/80">
                  {contactInfo.map((contact, index) => {
                    const Icon = contact.icon;
                    return (
                      <li key={index}>
                        <a
                          href={contact.href}
                          target={
                            contact.href.startsWith("http")
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            contact.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="flex items-center gap-2 hover:text-white transition-colors duration-200 group"
                          aria-label={contact.ariaLabel}
                        >
                          <Icon className="w-4 h-4 text-gray-300 dark:text-[#d23e3e] group-hover:scale-110 transition-transform" />
                          <span className="break-all">{contact.text}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </address>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/20 text-center pt-6 mt-8 text-xs text-white/60">
            <p>
              © {new Date().getFullYear()}{" "}
              {isArabic
                ? "جمعية جسر الأمل. جميع الحقوق محفوظة"
                : "Hope Bridge Association. All rights reserved"}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
