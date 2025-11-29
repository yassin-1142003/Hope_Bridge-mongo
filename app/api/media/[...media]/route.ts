import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import fs from "fs";
import path from "path";
import { beautifulLog } from "@/lib/beautifulResponse";

// GET - Serve media file by filename or path
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ media: string[] }> }
) {
  const startTime = Date.now();
  let mediaPath = 'unknown';
  
  try {
    const { media } = await params;
    mediaPath = media.join('/'); // Reconstruct the path
    
    beautifulLog.media('SERVE', mediaPath);

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

        beautifulLog.success(`Media served from database: ${mediaPath}`);
        beautifulLog.api('GET', `/api/media/${mediaPath}`, 200, Date.now() - startTime);

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

      beautifulLog.success(`Media served from public: ${mediaPath}`);
      beautifulLog.api('GET', `/api/media/${mediaPath}`, 200, Date.now() - startTime);

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
      beautifulLog.warning(`Media not found, using fallback: ${mediaPath}`);
      beautifulLog.api('GET', `/api/media/${mediaPath}`, 200, Date.now() - startTime);
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    }

    // Return 404 if nothing found
    beautifulLog.warning(`Media not found: ${mediaPath}`);
    beautifulLog.api('GET', `/api/media/${mediaPath}`, 404, Date.now() - startTime);
    return new NextResponse('Media not found', { status: 404 });

  } catch (error) {
    beautifulLog.error('Media serving error', error);
    beautifulLog.api('GET', `/api/media/${mediaPath}`, 500, Date.now() - startTime);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
