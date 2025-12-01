import { NextRequest, NextResponse } from 'next/server';
import { getHopeBridgeModels } from '@/lib/database/models/hopebridge';
import DatabaseManager from '@/lib/database';

// GET all users
export async function GET(request: NextRequest) {
  try {
    // Ensure database is connected
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isConnected('hopebridge')) {
      await dbManager.connect('hopebridge');
    }

    const { User } = getHopeBridgeModels();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');

    // Build query
    const query: any = {};
    if (role) query.role = role.toUpperCase();
    if (isActive !== null) query.isActive = isActive === 'true';

    // Get users with pagination
    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    // Ensure database is connected
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isConnected('hopebridge')) {
      await dbManager.connect('hopebridge');
    }

    const { User } = getHopeBridgeModels();
    const body = await request.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User with this email already exists' 
        },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User(body);
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'User created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
