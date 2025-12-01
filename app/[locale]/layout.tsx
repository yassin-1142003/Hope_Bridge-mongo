// app/[locale]/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Almarai, Tajawal } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMessages } from "next-intl/server";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import Footer4Col from "@/components/layout/Footer";
import AOSWrapper from "@/components/AOSWrapper";
import { Toaster } from "sonner";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth";
import AddToHomeIOS from "@/components/AddToHomeIOS";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const almarai = Almarai({
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  subsets: ["arabic", "latin"],
});
const tajawal = Tajawal({
  weight: ["300", "400", "700", "800"],
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  // title: "Hope Bridge — Together for Gaza",
  title: "Hope Bridge Association",
  description:
    "Hope Bridge delivers food, water, warmth, and hope to families in Gaza. Join us in making a difference.",

  keywords: [
    "Hope Bridge",
    "Hope Bridge Charity",
    "Hope Bridge Association",
    "جمعية جسر الامل",
    "جسر الامل ",
    "مساعدات غزة",
    "تبرع لفلسطين",
    "جمعية خيرية غزة",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Hope Bridge",
    statusBarStyle: "black-translucent",
  },
  applicationName: "Hope Bridge",
  verification: {
    google: "cyTtDqbX4p0DgFYN7oRmfqLVUdtC0qPY7N6lPOjyO6c",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Hope Bridge Association (جمعية جسر الأمل)",
    description:
      "Hope Bridge (جمعية جسر الأمل) provides aid, support, and relief to families in Gaza.",
    url: "https://hopebridgecharity.com",
    siteName: "Hope Bridge | جمعية جسر الأمل",
    images: [
      {
        url: "https://hopebridgecharity.com/logo.webp",
        width: 1200,
        height: 630,
        alt: "Hope Bridge Charity | جمعية جسر الأمل",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hope Bridge Association (HBA)",
    description:
      "Hope Bridge delivers food, water, warmth, and hope to families in Gaza. Join us in making a difference.",
    images: ["https://hopebridgecharity.com/logo.webp"],
  },
  metadataBase: new URL("https://hopebridgecharity.com"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#d23e3e",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession();
  const messages = await getMessages();

  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale}>
      <head>
        {/* iOS-specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Hope Bridge" />

        <link rel="apple-touch-startup-image" href="/apple-touch-icon.png" />

        {/* Additional PWA meta tags */}
        {/* Note: theme-color has limited browser support but is essential for PWA functionality */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#d23e3e" />
        <meta name="msapplication-TileColor" content="#d23e3e" />
        <link rel="preconnect" href="https://donorbox.org" />
        <link rel="dns-prefetch" href="https://donorbox.org" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NonprofitOrganization",
              name: "Hope Bridge Association",
              alternateName: "جمعية جسر الأمل",
              url: "https://hopebridgecharity.com",
              logo: "https://hopebridgecharity.com/logo.webp",
              description:
                "Hope Bridge (جمعية جسر الأمل) provides food, aid, and relief to Gaza.",
            }),
          }}
        />
      </head>
      <body
        className={`${almarai.variable} font-almarai bg-background antialiased`}
      >
        <ClientLayoutWrapper locale={locale} session={session} messages={messages}>
          <AOSWrapper>
            <main className="main-pattern pt-18">{children}</main>
            <AddToHomeIOS />
            <Toaster richColors position="bottom-right" />
          </AOSWrapper>
          <Footer4Col />
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
