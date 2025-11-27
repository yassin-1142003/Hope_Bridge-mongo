// projects/[id]/page.tsx
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import GradientText from "@/components/GradientText";
import type { PageProps } from "@/types/next";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import DeleteProjectButton from "@/components/DeleteProjectButton";
import MediaGallery from "@/components/MediaGallery";
import { Button } from "@/components/ui/button";
import SuggestProj from "@/components/SuggestProj";
import DonationModalWrapper from "@/components/DonationModalWrapper";
import Image from "next/image";

type LocalizedContent = {
  id: string;
  post_id: string;
  language_code: string;
  name: string;
  description: string;
  content: string;
};
const extractDriveId = (url: string) => {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : url; // if it’s already an ID, return as is
};
const extractIdFromSlug = (slug: string): string => {
  const match = slug.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : slug;
};

const getImageUrl = (url: string) => {
  const id = extractDriveId(url);
  return `https://drive.google.com/uc?export=view&id=${id}`;
};

const getVideoEmbedUrl = (url: string) => {
  const id = extractDriveId(url);
  return `https://drive.google.com/file/d/${id}/preview`;
};

// const getImageUrl = (url: string): string => {
//   const fileId = getGoogleDriveId(url);
//   return fileId
//     ? `https://drive.google.com/uc?export=view&id=${fileId}`
//     : url || "https://placehold.net/600x400.png?text=No+Image";
// };

export default async function ProjectPage({
  params,
}: PageProps<{ id: string; locale: string }>) {
  const { id, locale } = await params;
  console.log(id);
  const t = await getTranslations({ locale, namespace: "projects" });
  const session = await getServerSession(authOptions);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const projectId = extractIdFromSlug(id);
  const res = await fetch(`${baseUrl}/api/project/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("Failed to fetch project:", res.status);
    return notFound();
  }

  const { details } = await res.json();

  console.log(details);

  if (!details) return notFound();

  const localized =
    details.contents?.find(
      (c: LocalizedContent) => c.language_code === locale
    ) ||
    details.contents?.find((c: LocalizedContent) => c.language_code === "en");

  if (!localized) return notFound();

  const isArabic = locale === "ar";
  const imageIds = (details.images || [])
    .map((url: string) => getImageUrl(extractDriveId(url)))
    .filter(Boolean) as string[];

  const videoIds = (details.videos || [])
    .map((url: string) => getVideoEmbedUrl(extractDriveId(url)))
    .filter(Boolean) as string[];

  console.log("before pass to media Gallery ", imageIds, videoIds);

  return (
    <main
      className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 "
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto py-0 space-y-12">
        {/* Hero Section with Media */}
        <section className="relative">
          <MediaGallery
            imageUrls={imageIds}
            videoUrls={videoIds}
            className="my-10"
          />
        </section>

        {/* Project Header */}
        <section dir={isArabic ? "rtl" : "ltr"} className="  space-y-6">
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
          className={`relative bg-gradient-to-br from-[#ffffff] to-[#ffffff]  dark:from-gray-900 dark:to-gray-800 backdrop-blur-md p-6 md:p-10 rounded-2xl shadow-lg transition-all`}
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
        <section className=" bottom-6 flex justify-center">
          <div>
            <Link href={`/${locale}/donate`}>
              <Button className="font-bold cursor-pointer">
                {t("singleproject.donate")}
              </Button>
            </Link>
            {/* <DonationModalWrapper locale={locale} /> */}
          </div>
          {!(!session || session.user.role !== "manager") && (
            <div className="flex gap-3 px-5 items-center">
              <Link href={`/${locale}/dashboard/edit/${id}`}>
                <PencilIcon className="w-5 h-5" />
              </Link>
              <DeleteProjectButton id={id} locale={locale} />
            </div>
          )}
        </section>
      </div>
      <div className="flex items-center justify-center">
        <div className="h-[1px] w-3/4 my-5 self-center bg-gray-500/50"></div>
      </div>
      <section
        className={`w-full mx-auto pb-10 ${
          isArabic ? "rtl text-right" : "ltr text-left"
        }`}
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className={`flex w-full  flex-row  justify-between items-center `}>
          <h2 className=" mx-auto  md:text-2xl text-lg font-extrabold text-primary border-b-4 border-primary/40 pb-2">
            {isArabic ? " مشاريع ذات صلة" : "Related Projects"}
          </h2>
        </div>
        <SuggestProj locale={locale} />
      </section>
    </main>
  );
}
