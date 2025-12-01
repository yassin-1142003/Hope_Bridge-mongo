import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { beautifulLog } from '@/lib/beautifulResponse';

export async function GET() {
  try {
    beautifulLog.info('📊 Fetching new projects count');
    
    const projectsCollection = await getCollection('projects');
    const now = new Date();
    
    // Get projects created in the last 24 hours
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const newProjectsCount = await projectsCollection.countDocuments({
      createdAt: { $gte: twentyFourHoursAgo },
      status: { $ne: 'draft' } // Only count published projects
    });
    
    beautifulLog.success(`✅ Found ${newProjectsCount} new projects in last 24 hours`);
    
    return NextResponse.json({
      success: true,
      count: newProjectsCount,
      timeframe: '24 hours',
      timestamp: now.toISOString()
    });
    
  } catch (error) {
    beautifulLog.error('❌ Failed to fetch new projects count:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch new projects count',
      count: 0
    }, { status: 500 });
  }
}
