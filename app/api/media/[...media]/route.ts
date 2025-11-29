import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import fs from "fs";
import path from "path";

// GET - Serve media file by filename or path
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ media: string[] }> }
) {
  try {
    const { media } = await params;
    const mediaPath = media.join('/'); // Reconstruct the path
    
    console.log('🔍 Media request:', mediaPath);

    // Try to find media in database first
    const mediaCollection = await getCollection('media');
    const mediaRecord = await mediaCollection.findOne({
      $or: [
        { filename: mediaPath },
        { url: mediaPath },
        { name: mediaPath }
      ]
    });

    if (mediaRecord && mediaRecord.path) {
      // Serve from local storage
      const fullPath = path.join(process.cwd(), 'public', mediaRecord.path);
      
      if (fs.existsSync(fullPath)) {
        const fileBuffer = fs.readFileSync(fullPath);
        const ext = path.extname(fullPath).toLowerCase();
        
        // Determine content type
        const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                           ext === '.png' ? 'image/png' :
                           ext === '.webp' ? 'image/webp' :
                           ext === '.gif' ? 'image/gif' :
                           ext === '.mp4' ? 'video/mp4' :
                           ext === '.webm' ? 'video/webm' :
                           ext === '.pdf' ? 'application/pdf' :
                           'application/octet-stream';

        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
          },
        });
      }
    }

    // Try to serve from public directory directly
    const publicPath = path.join(process.cwd(), 'public', mediaPath);
    if (fs.existsSync(publicPath)) {
      const fileBuffer = fs.readFileSync(publicPath);
      const ext = path.extname(publicPath).toLowerCase();
      
      const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                         ext === '.png' ? 'image/png' :
                         ext === '.webp' ? 'image/webp' :
                         ext === '.gif' ? 'image/gif' :
                         ext === '.mp4' ? 'video/mp4' :
                         ext === '.webm' ? 'video/webm' :
                         ext === '.pdf' ? 'application/pdf' :
                         'application/octet-stream';

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    }

    // If not found, try to serve fallback image
    const fallbackPath = path.join(process.cwd(), 'public', 'homepage', '01.webp');
    if (fs.existsSync(fallbackPath)) {
      const fileBuffer = fs.readFileSync(fallbackPath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    }

    // Return 404 if nothing found
    return new NextResponse('Media not found', { status: 404 });

  } catch (error) {
    console.error('❌ Media serving error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
