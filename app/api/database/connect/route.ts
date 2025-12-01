import { NextRequest, NextResponse } from 'next/server';
import DatabaseManager from '@/lib/database';

// Connect to all databases
export async function POST(request: NextRequest) {
  try {
    const dbManager = DatabaseManager.getInstance();
    
    // Connect to all databases
    await dbManager.connectAll();
    
    // Get connection status
    const status = dbManager.getConnectionStatus();
    
    return NextResponse.json({
      success: true,
      message: 'All databases connected successfully',
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to connect to databases',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get connection status
export async function GET(request: NextRequest) {
  try {
    const dbManager = DatabaseManager.getInstance();
    const status = dbManager.getConnectionStatus();
    
    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database status error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get database status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Disconnect from all databases
export async function DELETE(request: NextRequest) {
  try {
    const dbManager = DatabaseManager.getInstance();
    
    // Disconnect from all databases
    await dbManager.disconnectAll();
    
    return NextResponse.json({
      success: true,
      message: 'All databases disconnected successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database disconnection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to disconnect from databases',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
