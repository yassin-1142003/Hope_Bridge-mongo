// /app/api/trigger-rss/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { project_id } = await request.json();
    
    if (!project_id) {
      return NextResponse.json({ 
        error: 'Project ID is required' 
      }, { status: 400 });
    }
    
    // Update the project's RSS trigger timestamp in your database
    // This helps track when RSS was last triggered manually
    try {
      const updateRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/post/project/${project_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rss_triggered_at: new Date().toISOString(),
          rss_trigger_count: 1 // You can increment this in your DB
        })
      });
      
      if (!updateRes.ok) {
        console.warn('Could not update project trigger timestamp');
      }
    } catch (updateError) {
      console.warn('Database update failed:', updateError);
      // Continue anyway - RSS generation is more important
    }
    
    // Force RSS feed regeneration with cache busting
    const rssUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/rss?trigger=manual&t=${Date.now()}&project_id=${project_id}`;
    const rssRes = await fetch(rssUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!rssRes.ok) {
      throw new Error(`RSS generation failed: ${rssRes.status} ${rssRes.statusText}`);
    }
    
    const rssContent = await rssRes.text();
    
    // Optional: Ping IFTTT webhook to force immediate check
    // You can add this if IFTTT provides webhook URLs
    try {
      const iftttWebhook = process.env.IFTTT_WEBHOOK_URL;
      if (iftttWebhook) {
        await fetch(iftttWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            value1: project_id,
            value2: new Date().toISOString(),
            value3: 'manual_trigger'
          })
        });
      }
    } catch (webhookError) {
      console.warn('IFTTT webhook failed:', webhookError);
      // This is optional, so don't fail the whole request
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'RSS feed updated successfully! IFTTT should pick it up within 15 minutes.',
      rss_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/rss`,
      project_id: project_id,
      triggered_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Trigger RSS Error:', error);
    return NextResponse.json({ 
      error: 'Failed to trigger RSS feed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET method for testing
export async function GET(request: Request) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get('project_id');
  
  if (!projectId) {
    return NextResponse.json({
      message: 'RSS Trigger API is working',
      usage: 'POST /api/trigger-rss with { project_id: "your-project-id" }'
    });
  }
  
  // Test trigger via GET
  return POST(new Request(request.url, {
    method: 'POST',
    body: JSON.stringify({ project_id: projectId }),
    headers: { 'Content-Type': 'application/json' }
  }));
}

