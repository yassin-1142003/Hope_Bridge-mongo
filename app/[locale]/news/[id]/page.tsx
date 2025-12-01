//projects/[id]/page.tsx
import { notFound } from "next/navigation";
import GradientText from "@/components/GradientText";
import type { PageProps } from "@/types/next";
import Image from "next/image";
import { PencilIcon } from "lucide-react";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import DeleteProjectButton from "@/components/DeleteProjectButton";
import { Button } from "@/components/ui/button";
import SuggestProj from "@/components/SuggestProj";
import SuggestNews from "@/components/SuggestNews";

type LocalizedContent = {
  id: string;
  post_id: string;
  language_code: string;
  name: string;
  description: string;
  content: string;
};

export default async function ProjectPage({
  params,
}: PageProps<{ id: string; locale: string }>) {
  // ✅ Await the params Promise
  const { id, locale } = await params;
  const session = await getServerSession();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // ✅ Fix API path
  const res = await fetch(`${baseUrl}/api/post/news/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch project:", res.status);
    return notFound();
  }

  // If API returns array, pick the first
  const { details } = await res.json();
  if (!details) return notFound();

  const localized =
    details.contents?.find(
      (c: LocalizedContent) => c?.language_code === locale
    ) ||
    details.contents?.find((c: LocalizedContent) => c?.language_code === "en");

  if (!localized) return notFound();

  const isArabic = locale === "ar";

  return (
    <main
      className="min-h-screen  bg-gradient-to-b from-background to-muted/30 px-4 "
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Banner */}
      <div className="max-w-4xl mx-auto py-0 space-y-12">
        <Image
          src={details.images[0] || "https://placehold.co/1200x500"}
          alt={localized.name || "Project Banner"}
          width={1200}
          height={500}
          loading="lazy"
          className="object-cover w-full h-[200px] md:h-[400px]  rounded-none shadow-md"
        />
      </div>
      <div className="max-w-4xl mx-auto py-0 space-y-12">
        <section
          dir={isArabic ? "rtl" : "ltr"}
          className="  text-center md:text-left space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            <GradientText
              colors={["#d23e3e", "#000000", "#d23e3e"]}
              darkColors={["#d23e3e", "#d84040", "#ECDFCC"]}
              animationSpeed={3}
              className="font-almarai"
            >
              {localized.name}
            </GradientText>
          </h1>

          <p
            className={`text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto md:mx-0 ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            {localized.description}
          </p>
        </section>

        {/* Content Section */}
        <section
          dir={isArabic ? "rtl" : "ltr"}
          className={`relative bg-white/70 dark:bg-black/40 backdrop-blur-md p-6 md:p-10 rounded-2xl shadow-lg transition-all`}
        >
          <div
            className={`prose prose-lg dark:prose-invert max-w-none leading-relaxed whitespace-pre-line ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            {localized.content}
          </div>
        </section>

        {/* Action Bar */}
        <section className="sticky bottom-6 flex justify-center">
          {/* <div className="flex  items-center gap-4 bg-primary text-white px-6 py-3 rounded-2xl shadow-xl hover:scale-105 transition-all">
          <Link href={`/${locale}/donate`}>
            <Button className="font-bold cursor-pointer text-lg">
              {t("singleproject.donate")}
            </Button>
          </Link>
        </div> */}
          {!(!session || session.user.role !== "ADMIN") && (
            <div className="flex gap-3 px-5 items-center">
              <Link href={`/${locale}/dashboard/edit/${id}`}>
                <PencilIcon className="w-5 h-5" />
              </Link>
              <DeleteProjectButton id={id} locale={locale} />
            </div>
          )}
        </section>
      </div>
      <div className="flex items-center justify-center"></div>
      <section
        className={`w-full mx-auto pb-10 ${
          isArabic ? "rtl text-right" : "ltr text-left"
        }`}
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div
          className={`flex w-full  flex-row  justify-between items-center mb-8`}
        >
          <h2 className=" mx-auto  md:text-2xl text-lg font-extrabold text-primary border-b-4 border-primary/40 pb-2">
            {isArabic ? " أخر الاخبار " : " Latest News"}
          </h2>
        </div>

        <SuggestNews locale={locale} />
      </section>
    </main>
  );
}
