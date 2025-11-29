/* eslint-disable @next/next/no-img-element */
//work good just press create idea then press as a post
import { NextResponse } from "next/server";
import RSS from "rss";

interface ProjectContent {
  id: string;
  post_id: string;
  language_code: string;
  name: string;
  description: string;
  content: string;
}

// ✅ Convert Google Drive file links to direct links
function googleDriveToDirect(url: string): string {
  const match = url.match(/\/d\/([^/]+)\//);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;

  const match2 = url.match(/file\/d\/([^/]+)\/view/);
  if (match2) return `https://drive.google.com/uc?export=view&id=${match2[1]}`;

  return url; // fallback
}

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/post/project`
    );
    const data = await res.json();

    if (!data.success || !data.details.length) {
      return new Response("No projects found", { status: 404 });
    }

    // آخر مشروع
    const lastProject = data.details[0];
    const arContent = lastProject.contents.find(
      (c: ProjectContent) => c.language_code === "ar"
    );

    if (!arContent) {
      return new Response("No Arabic content found", { status: 404 });
    }

    const images: string[] = lastProject.images.map(googleDriveToDirect);
    const videos: string[] = lastProject.videos.map(googleDriveToDirect);

    const feed = new RSS({
      title: arContent.name,
      description: arContent.description,
      feed_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/rss`,
      site_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      language: "ar",
      pubDate: new Date(lastProject.created_at),
    });

    // 🟢 جهّز كل العناصر (صور + فيديوهات) منفصلة
    const mediaElements = [
      ...images.map((img) => ({
        "media:content": { _attr: { url: img, type: "image/jpeg" } },
      })),
      ...videos.map((vid) => ({
        "media:content": { _attr: { url: vid, type: "video/mp4" } },
      })),
    ];

    // أضف المشروع كـ item
    feed.item({
      title: arContent.name,
      description: arContent.description+ '\n' + arContent.content,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/projects/${lastProject.id}`,
      guid: lastProject.id,
      date: new Date(lastProject.created_at),
      custom_elements: mediaElements,
    });

    return new Response(feed.xml({ indent: true }), {
      status: 200,
      headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to generate RSS" },
      { status: 500 }
    );
  }
}
