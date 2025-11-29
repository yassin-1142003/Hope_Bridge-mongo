import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function cleanupDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }
  
  console.log('🔗 Connecting to MongoDB Atlas...');
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    const db = client.db();
    
    // Remove empty usr collection
    console.log('🗑️  Removing empty usr collection...');
    await db.collection('usr').drop();
    console.log('✅ usr collection removed successfully');
    
    // Check final collections
    const collections = await db.listCollections().toArray();
    console.log('📊 Final Collections:');
    collections.forEach(col => console.log('  -', col.name));
    
    console.log('✅ Database cleanup completed!');
    
  } catch (error) {
    console.error('❌ Database operation error:', error.message);
  } finally {
    await client.close();
  }
}

cleanupDatabase();
