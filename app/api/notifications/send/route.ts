import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { beautifulLog } from '@/lib/beautifulResponse';

export async function POST(request: NextRequest) {
  try {
    beautifulLog.info('📤 Sending notification to users');
    
    const { message, type, targetUsers = 'all' } = await request.json();
    
    if (!message || !message.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }
    
    // Get users collection
    const usersCollection = await getCollection('users');
    
    // Build query based on target users
    let userQuery: any = { isActive: true };
    
    switch (targetUsers) {
      case 'volunteers':
        userQuery.role = { $in: ['VOLUNTEER', 'FIELD_OFFICER'] };
        break;
      case 'donors':
        userQuery.hasDonated = true;
        break;
      case 'project_managers':
        userQuery.role = { $in: ['PROJECT_COORDINATOR', 'ADMIN'] };
        break;
      // 'all' or default - no additional filters
    }
    
    // Get all target users
    const users = await usersCollection.find(userQuery).toArray();
    
    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No users found to notify'
      }, { status: 404 });
    }
    
    // Create notification records
    const notificationsCollection = await getCollection('notifications');
    const notifications = users.map(user => ({
      userId: user._id,
      userEmail: user.email,
      message: message.trim(),
      type: type || 'general',
      isRead: false,
      createdAt: new Date(),
      metadata: {
        targetGroup: targetUsers,
        totalRecipients: users.length
      }
    }));
    
    // Insert all notifications
    const result = await notificationsCollection.insertMany(notifications);
    
    beautifulLog.success(`✅ Notification sent to ${users.length} users`);
    
    // Here you could also integrate with external notification services
    // like email, SMS, push notifications, etc.
    await sendExternalNotifications(users, message, type);
    
    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      recipients: users.length,
      notificationIds: Object.values(result.insertedIds)
    });
    
  } catch (error) {
    beautifulLog.error('❌ Failed to send notification:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to send notification'
    }, { status: 500 });
  }
}

async function sendExternalNotifications(users: any[], message: string, type: string) {
  try {
    // Integration with email service
    if (process.env.EMAIL_SERVICE_ENABLED === 'true') {
      // Send email notifications
      beautifulLog.info('📧 Sending email notifications...');
      // Add your email service integration here
    }
    
    // Integration with SMS service
    if (process.env.SMS_SERVICE_ENABLED === 'true') {
      // Send SMS notifications
      beautifulLog.info('📱 Sending SMS notifications...');
      // Add your SMS service integration here
    }
    
    // Integration with push notification service
    if (process.env.PUSH_SERVICE_ENABLED === 'true') {
      // Send push notifications
      beautifulLog.info('🔔 Sending push notifications...');
      // Add your push notification service integration here
    }
    
    // Integration with IFTTT (if configured)
    if (process.env.IFTTT_WEBHOOK_URL) {
      await fetch(process.env.IFTTT_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          type,
          recipientCount: users.length,
          timestamp: new Date().toISOString()
        })
      });
      
      beautifulLog.success('🔗 IFTTT webhook triggered');
    }
    
  } catch (error) {
    beautifulLog.error('❌ Failed to send external notifications:', error);
    // Don't throw error here, just log it - the main notification was saved
  }
}
