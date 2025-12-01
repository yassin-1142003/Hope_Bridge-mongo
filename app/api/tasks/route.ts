import { NextRequest, NextResponse } from 'next/server';
import { getTaskManagementModels } from '@/lib/database/models/taskManagement';
import DatabaseManager from '@/lib/database';

// GET all tasks
export async function GET(request: NextRequest) {
  try {
    // Ensure database is connected
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isConnected('taskManagement')) {
      await dbManager.connect('taskManagement');
    }

    const { Task } = getTaskManagementModels();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const category = searchParams.get('category');

    // Build query
    const query: any = {};
    if (status) query.status = status.toUpperCase();
    if (priority) query.priority = priority.toUpperCase();
    if (assignedTo) query.assignedTo = assignedTo;
    if (category) query.category = category.toUpperCase();

    // Get tasks with pagination and populate
    const skip = (page - 1) * limit;
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tasks',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST create new task
export async function POST(request: NextRequest) {
  try {
    // Ensure database is connected
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager.isConnected('taskManagement')) {
      await dbManager.connect('taskManagement');
    }

    const { Task } = getTaskManagementModels();
    const body = await request.json();

    // Create new task
    const task = new Task(body);
    await task.save();

    // Populate related data
    await task.populate('assignedTo', 'name email avatar role');
    await task.populate('createdBy', 'name email avatar');
    if (task.project) {
      await task.populate('project', 'name status');
    }

    return NextResponse.json({
      success: true,
      data: task,
      message: 'Task created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create task',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
