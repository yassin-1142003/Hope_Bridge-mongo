import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getCollection } from '@/lib/mongodb';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Get token from cookie only (same as auth/me endpoint)
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value || '';
    
    console.log('DEBUG - Cookie token:', token ? token.substring(0, 20) + '...' : 'none');

    if (!token) {
      console.log('DEBUG - No token found in cookies');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Users can only see their own tasks unless they're admin/manager
    if (user.id !== params.userId && !['ADMIN', 'PROJECT_COORDINATOR', 'GENERAL_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // For now, return mock data since PostgreSQL isn't set up
    const mockTasks = [
      {
        id: 'task-1',
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the new feature',
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
      },
      {
        id: 'task-2',
        title: 'Review pull requests',
        description: 'Review and approve pending pull requests',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
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
      }
    ];

    return NextResponse.json(mockTasks);
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
