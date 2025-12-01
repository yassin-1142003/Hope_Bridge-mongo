const { MongoClient } = require('mongodb');

// Database configurations
const DATABASES = {
  hopebridge: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hopebridge',
    collections: ['users', 'projects', 'donations', 'volunteers']
  },
  taskManagement: {
    uri: process.env.TASK_MONGODB_URI || 'mongodb://localhost:27017/task-management',
    collections: ['tasks', 'taskusers', 'taskprojects', 'timeentries']
  },
  charity: {
    uri: process.env.CHARITY_DB_URI || 'mongodb://localhost:27017/charity',
    collections: ['users', 'posts', 'comments', 'notifications']
  }
};

async function initializeDatabase(dbName, config) {
  console.log(`🔄 Initializing ${dbName} database...`);
  
  try {
    const client = new MongoClient(config.uri);
    await client.connect();
    
    const db = client.db();
    
    // Create collections with validation schemas
    for (const collectionName of config.collections) {
      const collectionExists = await db.listCollections({ name: collectionName }).hasNext();
      
      if (!collectionExists) {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } else {
        console.log(`ℹ️  Collection already exists: ${collectionName}`);
      }
    }
    
    // Create indexes for better performance
    if (dbName === 'hopebridge') {
      // Users collection indexes
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ role: 1 });
      await db.collection('users').createIndex({ isActive: 1 });
      
      // Projects collection indexes
      await db.collection('projects').createIndex({ category: 1 });
      await db.collection('projects').createIndex({ status: 1 });
      await db.collection('projects').createIndex({ coordinator: 1 });
      await db.collection('projects').createIndex({ isActive: 1 });
      
      // Donations collection indexes
      await db.collection('donations').createIndex({ user: 1 });
      await db.collection('donations').createIndex({ project: 1 });
      await db.collection('donations').createIndex({ status: 1 });
      await db.collection('donations').createIndex({ transactionId: 1 }, { unique: true });
      
      // Volunteers collection indexes
      await db.collection('volunteers').createIndex({ user: 1 });
      await db.collection('volunteers').createIndex({ project: 1 });
      await db.collection('volunteers').createIndex({ status: 1 });
    }
    
    if (dbName === 'taskManagement') {
      // Tasks collection indexes
      await db.collection('tasks').createIndex({ assignedTo: 1 });
      await db.collection('tasks').createIndex({ createdBy: 1 });
      await db.collection('tasks').createIndex({ status: 1 });
      await db.collection('tasks').createIndex({ priority: 1 });
      await db.collection('tasks').createIndex({ dueDate: 1 });
      
      // Task users collection indexes
      await db.collection('taskusers').createIndex({ email: 1 }, { unique: true });
      await db.collection('taskusers').createIndex({ role: 1 });
      await db.collection('taskusers').createIndex({ department: 1 });
      
      // Task projects collection indexes
      await db.collection('taskprojects').createIndex({ manager: 1 });
      await db.collection('taskprojects').createIndex({ status: 1 });
      await db.collection('taskprojects').createIndex({ team: 1 });
      
      // Time entries collection indexes
      await db.collection('timeentries').createIndex({ task: 1 });
      await db.collection('timeentries').createIndex({ user: 1 });
      await db.collection('timeentries').createIndex({ date: 1 });
    }
    
    if (dbName === 'charity') {
      // Users collection indexes
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      
      // Posts collection indexes
      await db.collection('posts').createIndex({ author: 1 });
      await db.collection('posts').createIndex({ status: 1 });
      await db.collection('posts').createIndex({ createdAt: -1 });
      
      // Comments collection indexes
      await db.collection('comments').createIndex({ post: 1 });
      await db.collection('comments').createIndex({ author: 1 });
      
      // Notifications collection indexes
      await db.collection('notifications').createIndex({ user: 1 });
      await db.collection('notifications').createIndex({ type: 1 });
      await db.collection('notifications').createIndex({ read: 1 });
    }
    
    console.log(`✅ ${dbName} database initialized successfully`);
    await client.close();
    
  } catch (error) {
    console.error(`❌ Failed to initialize ${dbName} database:`, error);
    throw error;
  }
}

async function createSampleData() {
  console.log('🔄 Creating sample data...');
  
  try {
    const client = new MongoClient(DATABASES.hopebridge.uri);
    await client.connect();
    
    const db = client.db();
    
    // Create sample admin user
    const adminExists = await db.collection('users').findOne({ email: 'admin@hopebridge.org' });
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.collection('users').insertOne({
        name: 'System Administrator',
        email: 'admin@hopebridge.org',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Created admin user: admin@hopebridge.org');
    }
    
    // Create sample project
    const projectExists = await db.collection('projects').findOne({ title: 'Clean Water Initiative' });
    if (!projectExists) {
      await db.collection('projects').insertOne({
        title: 'Clean Water Initiative',
        description: 'Providing clean drinking water to rural communities in need.',
        category: 'HEALTH',
        targetAmount: 50000,
        currentAmount: 0,
        currency: 'USD',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        images: ['/homepage/01.webp'],
        location: 'Rural Communities',
        coordinator: null, // Will be updated after admin user creation
        volunteers: [],
        donations: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Created sample project: Clean Water Initiative');
    }
    
    await client.close();
    console.log('✅ Sample data created successfully');
    
  } catch (error) {
    console.error('❌ Failed to create sample data:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting database initialization...\n');
  
  try {
    // Initialize all databases
    for (const [dbName, config] of Object.entries(DATABASES)) {
      await initializeDatabase(dbName, config);
    }
    
    // Create sample data
    await createSampleData();
    
    console.log('\n🎉 All databases initialized successfully!');
    console.log('\n📋 Database Connection Info:');
    console.log('  - Hope Bridge: mongodb://localhost:27017/hopebridge');
    console.log('  - Task Management: mongodb://localhost:27017/task-management');
    console.log('  - Charity: mongodb://localhost:27017/charity');
    console.log('\n👤 Admin Login:');
    console.log('  - Email: admin@hopebridge.org');
    console.log('  - Password: admin123');
    
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  initializeDatabase,
  createSampleData,
  main
};
