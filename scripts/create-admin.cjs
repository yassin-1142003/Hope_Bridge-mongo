/**
 * Create Admin User Script (JavaScript version)
 * Run this script to create an initial admin user for testing
 */

const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user...');
    
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/hopebridge');
    await client.connect();
    
    const db = client.db('hopebridge');
    const usersCollection = db.collection('users');
    
    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({ email: 'admin@hopebridge.org' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      client.close();
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Create admin user
    const adminUser = {
      name: 'Admin User',
      email: 'admin@hopebridge.org',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await usersCollection.insertOne(adminUser);
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@hopebridge.org');
    console.log('🔑 Password: admin123');
    console.log('🆔 User ID:', result.insertedId);
    console.log('');
    console.log('🌐 You can now sign in at: http://localhost:3000/auth/signin');
    console.log('🎯 Admin panel: http://localhost:3000/admin');
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config();

// Run the script
createAdminUser().then(() => {
  console.log('🎉 Script completed!');
  process.exit(0);
});
