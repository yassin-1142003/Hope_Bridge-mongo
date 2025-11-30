import { Clock, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
const getGoogleDriveId = (url: string): string | null => {
  const match = url?.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

const getImageUrl = (url: string): string => {
  const fileId = getGoogleDriveId(url);
  return fileId
    ? `https://drive.google.com/uc?export=view&id=${fileId}`
    : url || "https://placehold.net/600x400.png?text=No+Image";
};

export default async function NewsSection({ locale }: { locale: string }) {
  const isArabic = locale === "ar";

  // ✅ fetch server-side
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/post/news`, {
    method: "GET",
    cache: "no-store", // always fresh
  });

  if (!res.ok) {
    console.error("Failed to fetch news");
    return <p className="text-destructive">Failed to load news.</p>;
  }

  const { details }: { details: NewsItem[] } = await res.json();

  if (!details || details.length === 0) {
    return <p className="text-accent-foreground">No news available.</p>;
  }

  // ✅ filter localized content
  const localizedNews = details.map((item) => {
    const content =
      item.contents.find((c) => c?.language_code === locale) ||
      item.contents[0]; // fallback
    return {
      id: item.id,
      img: item.images,
      title: content?.name || "Untitled",
      desc: content?.description || "",
      date: new Date(item.created_at).toLocaleDateString(
        isArabic ? "ar-EG" : "en-US",
        { year: "numeric", month: "short", day: "numeric" }
      ),
    };
  });

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="space-y-12">
        {/* Section Header */}
        <div
          className={`flex  flex-row ${
            isArabic ? "flex-row-reverse" : ""
          } justify-between items-center mb-8`}
        >
          <h2 className="text-3xl font-extrabold text-primary border-b-4 border-primary/40 pb-2">
            {isArabic ? "آخر الأخبار" : "Latest News"}
          </h2>
          <Link
            href={`/${locale}/news`}
            className="text-sm text-primary hover:underline"
          >
            {isArabic ? "عرض الكل " : "View All"}
          </Link>
        </div>
        <div className="space-y-8">
          {/* Featured News Card */}
          <a
            key={localizedNews[0].id}
            href={`/${locale}/news/${localizedNews[0].id}`}
            className="group block"
          >
            <article className="bg-card rounded-none shadow-[var(--news-shadow)] overflow-hidden transition-[var(--transition-smooth)] hover:shadow-[var(--news-shadow-hover)]">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                {/* Featured Image */}
                <div className="lg:col-span-3 relative h-72 lg:h-96 overflow-hidden">
                  <Image
                    loading="lazy"
                    width={380}
                    height={214}
                    alt={localizedNews[0].title || "Featured News"}
                    src={
                      getImageUrl(localizedNews[0].img[0]) ||
                      "https://placehold.net/default.svg"
                    }
                    className="object-cover h-full w-full transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-background px-3 py-1 rounded-full text-sm font-medium">
                      {isArabic ? "مميز" : "Featured"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div
                  className={`lg:col-span-2 p-8 flex flex-col justify-between space-y-6 ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  <div className="space-y-4">
                    <h3 className="text-2xl lg:text-3xl font-bold text-accent-foreground leading-tight group-hover:text-primary transition-colors">
                      {localizedNews[0].title}
                    </h3>
                    <p className="text-accent-foreground leading-relaxed text-lg">
                      {localizedNews[0].desc}
                    </p>
                  </div>

                  <div
                    className={`flex items-center justify-between pt-3 border-t border-border ${
                      isArabic ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-accent-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{localizedNews[0].date}</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 flex-row   text-primary text-sm font-medium group-hover:gap-2 transition-all`}
                    >
                      <span>{isArabic ? "اقرأ" : "Read"}</span>
                      <ArrowRight className={`w-3 h-3 `} />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </a>

          {/* Grid of Smaller News Cards */}
          <div
            dir={isArabic ? "rtl" : "ltr"}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          >
            {localizedNews.slice(1, 6).map((item) => (
              <a
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
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
