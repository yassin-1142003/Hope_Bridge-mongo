import type { PageProps } from "@/types/next";

export default async function HomePage({
  params,
}: PageProps<{ locale: string }>) {
  const { locale } = await params;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">
        {locale === 'ar' ? 'مرحباً' : 'Welcome'} - {locale}
      </h1>
    </div>
  );
}
