const { MongoClient } = require('mongodb');

async function checkCollections() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  try {
    await client.connect();
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
