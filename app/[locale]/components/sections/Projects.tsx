// app/components/ProjectSlider.tsx

import ProjectSliderClient from "../../../../components/projectSlider";
import { getTranslations } from "next-intl/server";

interface ProjectContent {
  language_code: string;
  name: string;
  description: string;
  content: string;
  images: string[];
  videos: string[];
  documents: string[];
}

interface Project {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  status: string;
  category: string;
  featured?: boolean;
  bannerPhotoUrl?: string;
  images?: string[];
  gallery?: Array<{
    id: string;
    url: string;
    alt: string;
    caption: string;
  }>;
  videos?: Array<{
    id: string;
    url: string;
    thumbnail?: string;
    title: string;
    duration?: string;
    description?: string;
  }>;
  allMedia?: any[];
  mediaCount?: {
    images: number;
    videos: number;
    total: number;
  };
  createdAt: Date;
  updatedAt: Date;
  // Legacy compatibility
  contents?: ProjectContent[];
  legacyGallery?: string[];
}

export default async function ProjectSlider({
  params: { locale },
}: {
  params: { locale: string };
}) {
  try {
    // ✅ fetch server-side with timeout and error handling
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    
    console.log('🔄 Attempting to fetch projects from:', `${baseUrl}/api/projects`);
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: "GET",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error("Failed to fetch projects, status:", res.status);
      throw new Error(`API responded with status: ${res.status}`);
    }

    const result = await res.json();
    console.log('📊 Projects API Response:', result);

    // Handle both old and new API structures
    let projects: Project[] = [];
    
    if (result.success && result.data) {
      // New enhanced API structure
      projects = result.data.map((project: any) => {
        // Create compatible project structure
        const compatibleProject: Project = {
          _id: project._id || project.id,
          title: project.title || 'Untitled Project',
          description: project.description || '',
          shortDescription: project.shortDescription || project.description?.substring(0, 100) || '',
          status: project.status || 'active',
          category: project.category || 'general',
          featured: project.featured || false,
          bannerPhotoUrl: project.bannerPhotoUrl || project.images?.[0] || '/homepage/01.webp',
          images: project.images || [],
          gallery: project.gallery || [],
          videos: project.videos || [],
          allMedia: project.allMedia || [],
          mediaCount: project.mediaCount || { images: 0, videos: 0, total: 0 },
          createdAt: project.createdAt || new Date(),
          updatedAt: project.updatedAt || new Date(),
          // Legacy compatibility
          contents: project.contents || [{
            language_code: locale,
            name: project.title || 'Untitled Project',
            description: project.description || '',
            content: project.description || '',
            images: project.images || [],
            videos: project.videos?.map((v: any) => v.url) || [],
            documents: []
          }],
          legacyGallery: project.gallery?.map((g: any) => g.url) || project.images || []
        };
        
        return compatibleProject;
      });
    } else if (result.details) {
      // Legacy API structure
      projects = result.details;
    } else {
      console.warn('Unexpected API response structure:', result);
      projects = [];
    }

    console.log(`📊 Processing ${projects.length} projects for display`);

    // ✅ Pass only first 10 projects to client
    const displayProjects = projects.slice(0, 10);
    const p = await getTranslations({ locale, namespace: "projects" });

    return (
      <>
        <div
          data-aos="fade-up"
          className="flex flex-col px-5 justify-center items-center text-center "
        >
          <div className="flex items-center w-full gap-4 mb-8">
            <div className="h-1 flex-1 bg-linear-to-l w-full from-gray-400 to-transparent" />
            <h1 className="text-4xl md:text-6xl text-primary font-extrabold drop-shadow-lg">
              {p("title")}
            </h1>
            <div className="h-1 flex-1 bg-linear-to-l w-full  from-transparent to-gray-400" />
          </div>

          <p className="mt-6 text-xl md:text-2xl text-accent-foreground font-bold max-w-4xl">
            {p("subtitle")}
          </p>
        </div>
        <ProjectSliderClient projects={displayProjects} />
      </>
    );
  } catch (error: any) {
    console.error('❌ Error in Projects component:', error.message);
    
    // Return fallback projects when API fails
    const fallbackProjects: Project[] = [
      {
        _id: 'fallback-1',
        title: "Community Garden Project",
        description: "Transforming unused spaces into thriving community gardens",
        shortDescription: "Urban gardening initiative",
        status: "active",
        category: "community",
        featured: true,
        bannerPhotoUrl: "/homepage/01.webp",
        images: ["/homepage/02.webp", "/homepage/03.webp"],
        gallery: [
          {
            id: "img_001",
            url: "/homepage/01.webp",
            alt: "Community garden project",
            caption: "Transforming spaces together"
          }
        ],
        videos: [],
        allMedia: [],
        mediaCount: { images: 3, videos: 0, total: 3 },
        createdAt: new Date(),
        updatedAt: new Date(),
        contents: [{
          language_code: locale,
          name: "Community Garden Project",
          description: "Transforming unused spaces into thriving community gardens",
          content: "Urban gardening initiative",
          images: ["/homepage/02.webp", "/homepage/03.webp"],
          videos: [],
          documents: []
        }],
        legacyGallery: ["/homepage/01.webp"]
      },
      {
        _id: 'fallback-2',
        title: "Youth Education Initiative",
        description: "Providing educational resources and mentorship to underprivileged youth",
        shortDescription: "Education empowerment program",
        status: "active",
        category: "education",
        featured: true,
        bannerPhotoUrl: "/aboutus/hero.webp",
        images: ["/aboutus/hero2.webp", "/aboutus/hero3.webp"],
        gallery: [
          {
            id: "img_002",
            url: "/aboutus/hero.webp",
            alt: "Youth education program",
            caption: "Empowering young minds"
          }
        ],
        videos: [],
        allMedia: [],
        mediaCount: { images: 3, videos: 0, total: 3 },
        createdAt: new Date(),
        updatedAt: new Date(),
        contents: [{
          language_code: locale,
          name: "Youth Education Initiative",
          description: "Providing educational resources and mentorship to underprivileged youth",
          content: "Education empowerment program",
          images: ["/aboutus/hero2.webp", "/aboutus/hero3.webp"],
          videos: [],
          documents: []
        }],
        legacyGallery: ["/aboutus/hero.webp"]
      }
    ];

    console.log('🔄 Using fallback projects data due to API failure');
    const p = await getTranslations({ locale, namespace: "projects" });

    return (
      <>
        <div
          data-aos="fade-up"
          className="flex flex-col px-5 justify-center items-center text-center "
        >
          <div className="flex items-center w-full gap-4 mb-8">
            <div className="h-1 flex-1 bg-linear-to-l w-full from-gray-400 to-transparent" />
            <h1 className="text-4xl md:text-6xl text-primary font-extrabold drop-shadow-lg">
              {p("title")}
            </h1>
            <div className="h-1 flex-1 bg-linear-to-l w-full  from-transparent to-gray-400" />
          </div>

          <p className="mt-6 text-xl md:text-2xl text-accent-foreground font-bold max-w-4xl">
            {p("subtitle")}
          </p>
        </div>
        <ProjectSliderClient projects={fallbackProjects} />
      </>
    );
  }
}
