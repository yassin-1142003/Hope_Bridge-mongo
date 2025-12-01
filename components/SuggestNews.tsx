import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import type { PageProps } from "@/types/next";
import { ArrowRight, Clock } from "lucide-react";

type LocalizedContent = {
  id: string;
  post_id: string;
  language_code: string;
  name: string;
  description: string;
  content: string;
};

type NewsItem = {
  id: string;
  created_at: string;
  images: string;
  category: string;
  contents: LocalizedContent[];
};

const SuggestNews = async ({ locale }: { locale: string }) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/post/news`, {
    next: { revalidate: 3600 },
    method: "GET",
    headers: { "Cache-Control": "no-cache" },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch details");

  const { details }: { details: NewsItem[] } = await res.json();
  const t = await getTranslations("News");
  const isArabic = locale === "ar";

  // Pick localized content for each news item
  const localizedNews = details.map((item) => {
    const localized =
      item.contents.find((c) => c?.language_code === locale) ||
      item.contents.find((c) => c?.language_code === "en"); // fallback
    return {
      id: item.id,
      img: item.images || "/default-news.jpg",
      title: localized?.name ?? t("title"),
      desc: localized?.description ?? t("desc"),
      date: new Date(item.created_at).toLocaleDateString(
        isArabic ? "ar-EG" : "en-US",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      ),
    };
  });

  return (
    <main className="min-h-screen bg-background">
      {/* News Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div
          dir={isArabic ? "rtl" : "ltr"}
          className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8`}
        >
          {localizedNews.map((item) => (
            <Link
              key={item.id}
              href={`/${locale}/news/${item.id}`}
              className="group block"
            >
              <article className="bg-card rounded-none shadow-[var(--news-shadow)] overflow-hidden transition-[var(--transition-smooth)] hover:shadow-[var(--news-shadow-hover)] h-full">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    loading="lazy"
                    width={320}
                    height={190}
                    src={item.img[0]}
                    alt={item.title}
                    className="object-cover w-full h-full  transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent" />
                </div>

                {/* Content */}
                <div
                  className={`p-6 flex flex-col space-y-4 flex-1 ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  <h4 className="font-bold text-lg text-accent-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h4>

                  <p className="text-accent-foreground text-sm leading-relaxed flex-1 line-clamp-3">
                    {item.desc}
                  </p>

                  <div
                    className={`flex items-center justify-between pt-3 border-t border-border ${
                      isArabic ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-accent-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{item.date}</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 flex-row   text-primary text-sm font-medium group-hover:gap-2 transition-all`}
                    >
                      <span>{isArabic ? "اقرأ" : "Read"}</span>
                      <ArrowRight className={`w-3 h-3 `} />
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
};

export default SuggestNews;
