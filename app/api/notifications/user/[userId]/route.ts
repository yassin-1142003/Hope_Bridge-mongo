import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }
    
    const notificationsCollection = await getCollection('notifications');
    
    const notifications = await notificationsCollection
      .find({ 
        userId: new ObjectId(userId),
        isDeleted: { $ne: true }
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    
    return NextResponse.json({
      success: true,
      notifications: notifications.map(n => ({
        ...n,
        _id: n._id.toString(),
        userId: n.userId.toString()
      }))
    });
    
  } catch (error) {
    console.error('Failed to fetch user notifications:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notifications'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }
    
    const notificationsCollection = await getCollection('notifications');
    
    const result = await notificationsCollection.updateMany(
      { 
        userId: new ObjectId(userId),
        isRead: false,
        isDeleted: { $ne: true }
      },
      { 
        $set: { 
          isRead: true,
          readAt: new Date()
        }
      }
    );
    
    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to mark notifications as read'
    }, { status: 500 });
  }
}
