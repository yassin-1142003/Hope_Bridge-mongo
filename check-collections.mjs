import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function checkCollections() {
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
    const collections = await db.listCollections().toArray();
    console.log('📊 Available Collections:');
    collections.forEach(col => console.log('  -', col.name));
    
    // Check for users vs usr
    const hasUsers = collections.some(c => c.name === 'users');
    const hasUsr = collections.some(c => c.name === 'usr');
    
    if (hasUsers && hasUsr) {
      console.log('⚠️  Both "users" and "usr" collections exist!');
      console.log('🔍 Checking contents...');
      
      const usersCount = await db.collection('users').countDocuments();
      const usrCount = await db.collection('usr').countDocuments();
      
      console.log('📋 users collection:', usersCount, 'documents');
      console.log('📋 usr collection:', usrCount, 'documents');
      
      if (usrCount === 0) {
        console.log('✅ usr collection is empty - can be safely removed');
      } else {
        console.log('⚠️  usr collection has data - needs manual review');
      }
    } else if (hasUsers) {
      console.log('✅ Only "users" collection exists (correct)');
    } else if (hasUsr) {
      console.log('⚠️  Only "usr" collection exists - should be renamed to "users"');
    } else {
      console.log('❌ No user collections found');
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    await client.close();
  }
}

checkCollections();
