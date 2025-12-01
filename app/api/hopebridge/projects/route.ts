import { NextRequest, NextResponse } from 'next/server';
import { getHopeBridgeModels } from '@/lib/database/models/hopebridge';
import DatabaseManager from '@/lib/database';

// GET all projects
export async function GET(request: NextRequest) {
  try {
    // Ensure database is connected
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isConnected('hopebridge')) {
      await dbManager.connect('hopebridge');
    }

    const { Project } = getHopeBridgeModels();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const coordinator = searchParams.get('coordinator');

    // Build query
    const query: any = { isActive: true };
    if (category) query.category = category.toUpperCase();
    if (status) query.status = status.toUpperCase();
    if (coordinator) query.coordinator = coordinator;

    // Get projects with pagination and populate
    const skip = (page - 1) * limit;
    const projects = await Project.find(query)
      .populate('coordinator', 'name email avatar')
      .populate('volunteers', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch projects',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST create new project
export async function POST(request: NextRequest) {
  try {
    // Ensure database is connected
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isConnected('hopebridge')) {
      await dbManager.connect('hopebridge');
    }

    const { Project } = getHopeBridgeModels();
    const body = await request.json();

    // Create new project
    const project = new Project(body);
    await project.save();

    // Populate coordinator info
    await project.populate('coordinator', 'name email avatar');

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create project',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
