import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return mock task data
    const mockTask = {
      id: params.taskId,
      title: 'Sample Task',
      description: 'This is a sample task for development',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      attachments: [],
      project: {
        id: 'project-1',
        name: 'HopeBridge Platform'
      },
      createdBy: {
        id: 'admin-1',
        name: 'System Admin'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(mockTask);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
