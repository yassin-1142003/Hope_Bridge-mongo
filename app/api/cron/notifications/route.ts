/**
 * Scheduled Notifications Cron Job
 * 
 * Automated system for checking overdue tasks, upcoming due dates,
 * and sending proactive notifications. Runs periodically.
 */

import { NextRequest, NextResponse } from 'next/server';
import { taskNotificationService } from '@/lib/services/TaskNotificationService';

// Simple authentication for cron jobs (you should use a more secure method in production)
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '');
    
    if (providedSecret !== CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'all';
    
    const results = {
      success: true,
      timestamp: new Date().toISOString(),
      actions: [] as any[]
    };
    
    // Check for overdue tasks
    if (action === 'all' || action === 'overdue') {
      try {
        await taskNotificationService.notifyOverdueTasks();
        results.actions.push({
          action: 'overdue_check',
          status: 'completed',
          message: 'Overdue task notifications sent'
        });
      } catch (error) {
        results.actions.push({
          action: 'overdue_check',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Check for upcoming due dates
    if (action === 'all' || action === 'upcoming') {
      try {
        await taskNotificationService.checkUpcomingDueDates();
        results.actions.push({
          action: 'upcoming_check',
          status: 'completed',
          message: 'Upcoming due date reminders sent'
        });
      } catch (error) {
        results.actions.push({
          action: 'upcoming_check',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Clean up old notifications
    if (action === 'all' || action === 'cleanup') {
      try {
        await taskNotificationService.cleanupOldNotifications(30);
        results.actions.push({
          action: 'cleanup',
          status: 'completed',
          message: 'Old notifications cleaned up'
        });
      } catch (error) {
        results.actions.push({
          action: 'cleanup',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Get notification statistics
    if (action === 'all' || action === 'stats') {
      try {
        const stats = await taskNotificationService.getNotificationStats();
        results.actions.push({
          action: 'stats',
          status: 'completed',
          data: stats
        });
      } catch (error) {
        results.actions.push({
          action: 'stats',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Support GET requests for manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}
