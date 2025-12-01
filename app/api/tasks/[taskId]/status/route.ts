import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function PATCH(
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

    const { status } = await request.json();

    if (!status || !['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Mock response - in production this would update the database
    // For now, just return a success response with the updated status
    return NextResponse.json({
      id: params.taskId,
      status: status,
      updatedAt: new Date().toISOString(),
      message: 'Task status updated successfully'
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
