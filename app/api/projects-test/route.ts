import { NextResponse } from "next/server";
import mongoose from "mongoose";

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

// GET - Simple test route without ProjectService
export async function GET() {
  try {
    console.log('🔄 Testing direct database connection...');
    
    await mongoose.connect(mongoUrl);
    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).sort({ created_at: -1 }).toArray();
    
    console.log(`✅ Retrieved ${projects.length} projects directly`);
    
    // Convert to proper format
    const formattedProjects = projects.map(project => ({
      id: project._id?.toString(),
      bannerPhotoUrl: project.bannerPhotoUrl,
      bannerPhotoId: project.bannerPhotoId,
      gallery: project.gallery || [],
      created_at: project.created_at,
      contents: project.contents || []
    }));
    
    return NextResponse.json({
      success: true,
      message: "Projects retrieved successfully (test route)",
      data: formattedProjects,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Error in test route:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch projects",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await mongoose.connection.close();
  }
}
