import { NextRequest, NextResponse } from "next/server";
import { getCollection } from '../../../lib/mongodb';

// Helper function to set CORS headers
const setCorsHeaders = (response: NextResponse) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

// GET - Get all projects with associated media
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching fresh projects from MongoDB...');
    
    // Handle MongoDB connection gracefully
    let projects: any[] = [];
    let mediaFiles: any[] = [];
    let isConnected = true;
    
    try {
      const projectsCollection = await getCollection('projects');
      const mediaCollection = await getCollection('media');
      
      // Fetch all projects
      projects = await projectsCollection.find({}).toArray();
      
      // Fetch all media files
      mediaFiles = await mediaCollection.find({}).toArray();
      
    } catch (dbError: any) {
      console.warn('⚠️ MongoDB not connected, returning sample data:', dbError.message);
      isConnected = false;
      
      // Return sample projects when MongoDB is not available
      projects = [
        {
          _id: { toString: () => 'sample-1' },
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
          mediaCount: { images: 3, videos: 0, total: 3 },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: { toString: () => 'sample-2' },
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
          mediaCount: { images: 3, videos: 0, total: 3 },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      mediaFiles = [];
    }
    
    // Convert media to array and organize by type for easier lookup
    const mediaArray = mediaFiles.map((media: any) => ({
      ...media,
      _id: media._id.toString(),
      id: media._id.toString()
    }));
    
    // Enhance projects with media information
    const enrichedProjects = projects.map((project: any) => {
      const projectObj = { ...project, _id: project._id.toString(), id: project._id.toString() };
      
      // Get all images
      const images = mediaArray.filter(media => 
        media.type === 'image' && 
        (
          // Check if media is associated with this project
          media.category === 'project' ||
          media.category === 'banner' ||
          media.category === 'gallery' ||
          // Check if filename contains project ID or title reference
          media.url.includes(project._id.toString()) ||
          media.title.toLowerCase().includes(project.title?.toLowerCase() || '')
        )
      );
      
      // Get all videos
      const videos = mediaArray.filter(media => 
        media.type === 'video' && 
        (
          // Check if media is associated with this project
          media.category === 'project' ||
          media.category === 'gallery' ||
          // Check if filename contains project ID or title reference
          media.url.includes(project._id.toString()) ||
          media.title.toLowerCase().includes(project.title?.toLowerCase() || '')
        )
      );
      
      // Get banner images
      const banners = mediaArray.filter(media => 
        media.type === 'image' && media.category === 'banner'
      );
      
      // Get gallery images
      const gallery = mediaArray.filter(media => 
        media.type === 'image' && media.category === 'gallery'
      );
      
      // Add arrays to project object
      projectObj.images = images;
      projectObj.videos = videos;
      projectObj.banners = banners;
      projectObj.gallery = gallery;
      projectObj.allMedia = [...images, ...videos];
      
      // If project has existing media arrays, merge with database media
      if (project.images && Array.isArray(project.images)) {
        projectObj.existingImages = project.images;
      }
      if (project.videos && Array.isArray(project.videos)) {
        projectObj.existingVideos = project.videos;
      }
      if (project.gallery && Array.isArray(project.gallery)) {
        projectObj.existingGallery = project.gallery;
      }
      
      return projectObj;
    });
    
    console.log(`✅ Retrieved ${enrichedProjects.length} projects with media from MongoDB`);
    console.log(`📁 Found ${mediaArray.length} total media files (${mediaArray.filter(m => m.type === 'image').length} images, ${mediaArray.filter(m => m.type === 'video').length} videos)`);
    
    const response = NextResponse.json({
      success: true,
      data: enrichedProjects,
      count: enrichedProjects.length,
      connectionStatus: isConnected ? 'connected' : 'sample_data',
      mediaStats: isConnected ? {
        totalMedia: mediaArray.length,
        totalImages: mediaArray.filter(m => m.type === 'image').length,
        totalVideos: mediaArray.filter(m => m.type === 'video').length,
        categories: Array.from(new Set(mediaArray.map(m => m.category)))
      } : {
        totalMedia: 0,
        totalImages: 0,
        totalVideos: 0,
        categories: []
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      status: 200
    });

    return setCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching projects:", error);
    const response = NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch projects" 
      },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}
