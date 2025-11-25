
// types/next.d.ts - Updated for Next.js 15
export type PageProps<T = {}> = {
  params: Promise<T>; // ✅ params is now a Promise in Next.js 15
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};