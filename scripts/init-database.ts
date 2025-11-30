/**
 * Database Initialization Script
 * 
 * This script sets up MongoDB with proper schemas, indexes, and sample data
 * for the HopeBridge dashboard to work correctly.
 */

import { config } from 'dotenv';
import { MongoClient, Db } from 'mongodb';
import { setupMongoSchemas, insertSampleData } from '../lib/mongodb/schemas';

// Load environment variables from parent directory
config({ path: '../.env' });

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'hopebridge';

async function initializeDatabase(): Promise<void> {
  console.log('🚀 Starting database initialization...');
  
  let client: MongoClient | null = null;
  
  try {
    // Connect to MongoDB
    console.log(`📡 Connecting to MongoDB: ${MONGODB_URI}`);
    client = new MongoClient(MONGODB_URI);
    
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    const db: Db = client.db(DB_NAME);
    console.log(`📂 Using database: ${DB_NAME}`);
    
    // Test connection
    await db.admin().ping();
    console.log('🏓 Database ping successful');
    
    // Setup schemas and indexes
    await setupMongoSchemas(db);
    
    // Insert sample data
    await insertSampleData(db);
    
    // Verify setup
    const collections = await db.listCollections().toArray();
    console.log(`📊 Created ${collections.length} collections:`);
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Count documents in each collection
    const userCount = await db.collection('users').countDocuments();
    const taskCount = await db.collection('tasks').countDocuments();
    const projectCount = await db.collection('projects').countDocuments();
    const notificationCount = await db.collection('notifications').countDocuments();
    
    console.log('\n📈 Database Statistics:');
    console.log(`  Users: ${userCount}`);
    console.log(`  Tasks: ${taskCount}`);
    console.log(`  Projects: ${projectCount}`);
    console.log(`  Notifications: ${notificationCount}`);
    
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Navigate to /en/dashboard/tasks');
    console.log('3. The dashboard should now work with real data');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    
    if (error instanceof Error) {
      console.error('\n🔍 Error Details:');
      console.error(`Message: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
    }
    
    // Provide troubleshooting tips
    console.log('\n🛠️ Troubleshooting Tips:');
    console.log('1. Make sure MongoDB is running: mongod');
    console.log('2. Check connection string in .env file');
    console.log('3. Verify MongoDB credentials and permissions');
    console.log('4. Ensure MongoDB version is 4.0 or higher');
    
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the initialization
if (require.main === module) {
  console.log('🎯 HopeBridge Database Initialization');
  console.log('=====================================\n');
  
  initializeDatabase()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase };
