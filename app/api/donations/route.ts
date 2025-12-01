import { NextRequest, NextResponse } from 'next/server';
import { getHopeBridgeModels } from '@/lib/database/models/hopebridge';
import DatabaseManager from '@/lib/database';

// GET all donations
export async function GET(request: NextRequest) {
  try {
    // Ensure database is connected
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isConnected('hopebridge')) {
      await dbManager.connect('hopebridge');
    }

    const { Donation } = getHopeBridgeModels();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const project = searchParams.get('project');
    const user = searchParams.get('user');

    // Build query
    const query: any = {};
    if (status) query.status = status.toUpperCase();
    if (project) query.project = project;
    if (user) query.user = user;

    // Get donations with pagination and populate
    const skip = (page - 1) * limit;
    const donations = await Donation.find(query)
      .populate('user', 'name email avatar')
      .populate('project', 'title category targetAmount currentAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Donation.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch donations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST create new donation
export async function POST(request: NextRequest) {
  try {
    // Ensure database is connected
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isConnected('hopebridge')) {
      await dbManager.connect('hopebridge');
    }

    const { Donation, Project } = getHopeBridgeModels();
    const body = await request.json();

    // Create new donation
    const donation = new Donation(body);
    await donation.save();

    // Update project's current amount
    await Project.findByIdAndUpdate(
      body.project,
      { $inc: { currentAmount: body.amount } }
    );

    // Populate related data
    await donation.populate('user', 'name email avatar');
    await donation.populate('project', 'title category targetAmount currentAmount');

    return NextResponse.json({
      success: true,
      data: donation,
      message: 'Donation created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create donation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
