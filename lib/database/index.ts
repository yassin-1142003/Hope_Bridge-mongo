import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

// Database connection configurations
const DATABASE_CONFIGS = {
  // Main Hope Bridge Database (MongoDB)
  hopebridge: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hopebridge',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  
  // Task Management Database (MongoDB)
  taskManagement: {
    uri: process.env.TASK_MONGODB_URI || 'mongodb://localhost:27017/task-management',
    options: {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  
  // Charity Backend Database (PostgreSQL - if needed)
  charity: {
    uri: process.env.CHARITY_DB_URI || 'mongodb://localhost:27017/charity',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  }
};

// Connection instances
const connections: Record<string, any> = {};

// Database connection manager
class DatabaseManager {
  private static instance: DatabaseManager;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  // Connect to all databases
  async connectAll(): Promise<void> {
    try {
      console.log('🔄 Connecting to all databases...');
      
      // Connect to Hope Bridge Database
      await this.connect('hopebridge');
      
      // Connect to Task Management Database
      await this.connect('taskManagement');
      
      // Connect to Charity Database
      await this.connect('charity');
      
      console.log('✅ All databases connected successfully');
    } catch (error) {
      console.error('❌ Database connection error:', error);
      throw error;
    }
  }

  // Connect to a specific database
  async connect(dbName: string): Promise<void> {
    try {
      const config = DATABASE_CONFIGS[dbName as keyof typeof DATABASE_CONFIGS];
      if (!config) {
        throw new Error(`Database configuration not found for: ${dbName}`);
      }

      if (connections[dbName]) {
        console.log(`✅ ${dbName} database already connected`);
        return;
      }

      const connection = await mongoose.createConnection(config.uri, config.options);
      connections[dbName] = connection;
      
      connection.on('connected', () => {
        console.log(`✅ Connected to ${dbName} database`);
      });

      connection.on('error', (err) => {
        console.error(`❌ Error in ${dbName} database connection:`, err);
      });

      connection.on('disconnected', () => {
        console.log(`🔌 Disconnected from ${dbName} database`);
        delete connections[dbName];
      });

    } catch (error) {
      console.error(`❌ Failed to connect to ${dbName} database:`, error);
      throw error;
    }
  }

  // Get database connection
  getConnection(dbName: string): any {
    if (!connections[dbName]) {
      throw new Error(`${dbName} database not connected`);
    }
    return connections[dbName];
  }

  // Disconnect from all databases
  async disconnectAll(): Promise<void> {
    try {
      console.log('🔄 Disconnecting from all databases...');
      
      const disconnectPromises = Object.keys(connections).map(async (dbName) => {
        await this.disconnect(dbName);
      });

      await Promise.all(disconnectPromises);
      console.log('✅ All databases disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection error:', error);
      throw error;
    }
  }

  // Disconnect from a specific database
  async disconnect(dbName: string): Promise<void> {
    try {
      const connection = connections[dbName];
      if (connection) {
        await connection.close();
        delete connections[dbName];
        console.log(`✅ Disconnected from ${dbName} database`);
      }
    } catch (error) {
      console.error(`❌ Failed to disconnect from ${dbName} database:`, error);
      throw error;
    }
  }

  // Check connection status
  isConnected(dbName: string): boolean {
    return connections[dbName] !== undefined;
  }

  // Get connection status for all databases
  getConnectionStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    Object.keys(DATABASE_CONFIGS).forEach(dbName => {
      status[dbName] = this.isConnected(dbName);
    });
    return status;
  }
}

export default DatabaseManager;
