import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const { notificationId } = await params;
    
    if (!notificationId) {
      return NextResponse.json({
        success: false,
        error: 'Notification ID is required'
      }, { status: 400 });
    }
    
    const notificationsCollection = await getCollection('notifications');
    
    const result = await notificationsCollection.updateOne(
      { _id: new ObjectId(notificationId) },
      { 
        $set: { 
          isRead: true,
          readAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Notification not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    });
    
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to mark notification as read'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const { notificationId } = await params;
    
    if (!notificationId) {
      return NextResponse.json({
        success: false,
        error: 'Notification ID is required'
      }, { status: 400 });
    }
    
    const notificationsCollection = await getCollection('notifications');
    
    const result = await notificationsCollection.updateOne(
      { _id: new ObjectId(notificationId) },
      { 
        $set: { 
          isDeleted: true,
          deletedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Notification not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notification deleted'
    });
    
  } catch (error) {
    console.error('Failed to delete notification:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete notification'
    }, { status: 500 });
  }
}
