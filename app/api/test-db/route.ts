import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test database connection
    const db = await getCollection('test');
    const test = await db.findOne({});
    
    // Test projects collection
    const projectsCollection = await getCollection('projects');
    const projects = await projectsCollection.find({}).limit(1).toArray();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        testConnection: !!test,
        projectsCount: await projectsCollection.countDocuments(),
        sampleProject: projects[0] ? {
          id: projects[0]._id,
          hasContents: !!projects[0].contents,
          createdAt: projects[0].createdAt
        } : null
      }
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
