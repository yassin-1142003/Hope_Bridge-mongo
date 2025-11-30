// app/api/notifications/email/route.ts - Email notifications API endpoint
import { NextRequest, NextResponse } from 'next/server';

// Server-side email notification manager
class ServerEmailManager {
  private emailLogs: Array<any> = [];
  
  async sendEmailNotification(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    from?: string;
    replyTo?: string;
  }): Promise<{ messageId: string; sent: boolean }> {
    try {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Mock email sending
      console.log('Sending email:', {
        to: options.to,
        subject: options.subject,
        messageId
      });
      
      // Store email log
      this.emailLogs.push({
        messageId,
        to: options.to,
        subject: options.subject,
        sentAt: new Date().toISOString(),
        status: 'sent'
      });
      
      return { messageId, sent: true };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
  
  async getEmailNotificationLogs(status?: string, limit: number = 50): Promise<any[]> {
    let logs = [...this.emailLogs];
    
    if (status) {
      logs = logs.filter(log => log.status === status);
    }
    
    return logs.slice(0, limit);
  }
}

const serverEmailManager = new ServerEmailManager();

// Simple auth verification (without external dependencies)
async function verifyAuth(request: NextRequest): Promise<{ isAuthenticated: boolean; userId?: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAuthenticated: false };
    }
    
    const token = authHeader.substring(7);
    
    // Simple JWT validation (in production, use proper JWT library)
    const parts = token.split('.');
    if (parts.length !== 3) return { isAuthenticated: false };
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    const now = Date.now() / 1000;
    
    if (payload.exp && payload.exp < now) {
      return { isAuthenticated: false };
    }
    
    return { 
      isAuthenticated: true, 
      userId: payload.id || payload.email || 'unknown' 
    };
  } catch (error) {
    return { isAuthenticated: false };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { to, subject, html, text, from, replyTo } = body;

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, and either html or text' },
        { status: 400 }
      );
    }

    // Send email notification
    const result = await serverEmailManager.sendEmailNotification({
      to,
      subject,
      html,
      text,
      from: from || 'noreply@hopebridgecharity.com',
      replyTo
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      sent: true
    });
  } catch (error) {
    console.error('Email notifications API error:', error);
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get email notification logs/status
    const emailLogs = await serverEmailManager.getEmailNotificationLogs(status || undefined, limit);

    return NextResponse.json({
      success: true,
      emailLogs,
      count: emailLogs.length
    });
  } catch (error) {
    console.error('Email notifications API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
