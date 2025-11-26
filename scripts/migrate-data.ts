#!/usr/bin/env ts-node

/**
 * Data Migration Script
 * Handles data migration between different schema versions
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

interface LegacyUser {
  _id: string;
  name?: string;
  email: string;
  password?: string;
  role?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LegacyProject {
  _id: string;
  title?: string;
  description?: string;
  gallery?: string[];
  bannerPhotoUrl?: string;
  contents?: Array<{
    type: string;
    data: string;
    order: number;
  }>;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not found in environment variables');
  }
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');
}

async function migrateUsers() {
  console.log('👥 Migrating users...');
  
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray() as LegacyUser[];
  
  let migratedCount = 0;
  
  for (const user of users) {
    const updates: any = {};
    
    // Ensure required fields
    if (!user.name) {
      updates.name = user.email.split('@')[0];
      console.log(`📝 Added name for user: ${user.email}`);
    }
    
    // Set default role if missing
    if (!user.role) {
      updates.role = 'USER';
      console.log(`👤 Set default role for user: ${user.email}`);
    }
    
    // Set default isActive if missing
    if (user.isActive === undefined) {
      updates.isActive = true;
      console.log(`✅ Set active status for user: ${user.email}`);
    }
    
    // Set default emailVerified if missing
    if (user.emailVerified === undefined) {
      updates.emailVerified = false;
      console.log(`📧 Set email verification status for user: ${user.email}`);
    }
    
    // Hash plain text passwords
    if (user.password && !user.password.startsWith('$2')) {
      updates.passwordHash = await bcrypt.hash(user.password, 12);
      updates.password = undefined; // Remove plain text password
      console.log(`🔒 Hashed password for user: ${user.email}`);
    }
    
    // Add timestamps if missing
    if (!user.createdAt) {
      updates.createdAt = new Date();
      console.log(`📅 Added createdAt for user: ${user.email}`);
    }
    
    if (!user.updatedAt) {
      updates.updatedAt = new Date();
    } else {
      updates.updatedAt = new Date();
    }
    
    if (Object.keys(updates).length > 0) {
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: updates }
      );
      migratedCount++;
    }
  }
  
  console.log(`✅ Migrated ${migratedCount} users`);
}

async function migrateProjects() {
  console.log('🏗️  Migrating projects...');
  
  const db = mongoose.connection.db;
  const projects = await db.collection('projects').find({}).toArray() as LegacyProject[];
  
  let migratedCount = 0;
  
  for (const project of projects) {
    const updates: any = {};
    
    // Migrate gallery to contents format
    if (project.gallery && project.gallery.length > 0 && (!project.contents || project.contents.length === 0)) {
      const contents = project.gallery.map((url, index) => ({
        type: 'image' as const,
        data: url,
        order: index
      }));
      
      // Add banner as first content if exists
      if (project.bannerPhotoUrl) {
        contents.unshift({
          type: 'image' as const,
          data: project.bannerPhotoUrl,
          order: -1
        });
      }
      
      updates.contents = contents;
      console.log(`🖼️  Migrated gallery to contents for project: ${project.title || project._id}`);
    }
    
    // Ensure required fields
    if (!project.title) {
      updates.title = 'Untitled Project';
      console.log(`📝 Added title for project: ${project._id}`);
    }
    
    if (!project.description) {
      updates.description = 'No description available';
      console.log(`📝 Added description for project: ${project.title || project._id}`);
    }
    
    // Set default isActive if missing
    if (project.isActive === undefined) {
      updates.isActive = true;
      console.log(`✅ Set active status for project: ${project.title || project._id}`);
    }
    
    // Add timestamps if missing
    if (!project.createdAt) {
      updates.createdAt = new Date();
      console.log(`📅 Added createdAt for project: ${project.title || project._id}`);
    }
    
    if (!project.updatedAt) {
      updates.updatedAt = new Date();
    } else {
      updates.updatedAt = new Date();
    }
    
    // Clean up old gallery field
    if (project.gallery) {
      updates.gallery = undefined;
    }
    
    if (Object.keys(updates).length > 0) {
      await db.collection('projects').updateOne(
        { _id: project._id },
        { $set: updates }
      );
      migratedCount++;
    }
  }
  
  console.log(`✅ Migrated ${migratedCount} projects`);
}

async function migratePosts() {
  console.log('📝 Migrating posts...');
  
  const db = mongoose.connection.db;
  const posts = await db.collection('posts').find({}).toArray();
  
  let migratedCount = 0;
  
  for (const post of posts) {
    const updates: any = {};
    
    // Ensure slug exists
    if (!post.slug && post.title) {
      updates.slug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      console.log(`🔗 Added slug for post: ${post.title}`);
    }
    
    // Set default category if missing
    if (!post.category) {
      updates.category = 'general';
      console.log(`📂 Set default category for post: ${post.title || post._id}`);
    }
    
    // Set default status if missing
    if (!post.status) {
      updates.status = 'published';
      console.log(`📊 Set default status for post: ${post.title || post._id}`);
    }
    
    // Set default isActive if missing
    if (post.isActive === undefined) {
      updates.isActive = true;
      console.log(`✅ Set active status for post: ${post.title || post._id}`);
    }
    
    // Add timestamps if missing
    if (!post.createdAt) {
      updates.createdAt = new Date();
      console.log(`📅 Added createdAt for post: ${post.title || post._id}`);
    }
    
    if (!post.updatedAt) {
      updates.updatedAt = new Date();
    } else {
      updates.updatedAt = new Date();
    }
    
    if (Object.keys(updates).length > 0) {
      await db.collection('posts').updateOne(
        { _id: post._id },
        { $set: updates }
      );
      migratedCount++;
    }
  }
  
  console.log(`✅ Migrated ${migratedCount} posts`);
}

async function migrateComments() {
  console.log('💬 Migrating comments...');
  
  const db = mongoose.connection.db;
  const comments = await db.collection('comments').find({}).toArray();
  
  let migratedCount = 0;
  
  for (const comment of comments) {
    const updates: any = {};
    
    // Set default isFrozen if missing
    if (comment.isFrozen === undefined) {
      updates.isFrozen = false;
      console.log(`❄️  Set frozen status for comment: ${comment._id}`);
    }
    
    // Set default isDeleted if missing
    if (comment.isDeleted === undefined) {
      updates.isDeleted = false;
      console.log(`🗑️  Set deleted status for comment: ${comment._id}`);
    }
    
    // Add timestamps if missing
    if (!comment.createdAt) {
      updates.createdAt = new Date();
      console.log(`📅 Added createdAt for comment: ${comment._id}`);
    }
    
    if (!comment.updatedAt) {
      updates.updatedAt = new Date();
    } else {
      updates.updatedAt = new Date();
    }
    
    if (Object.keys(updates).length > 0) {
      await db.collection('comments').updateOne(
        { _id: comment._id },
        { $set: updates }
      );
      migratedCount++;
    }
  }
  
  console.log(`✅ Migrated ${migratedCount} comments`);
}

async function cleanupOrphanedData() {
  console.log('🧹 Cleaning up orphaned data...');
  
  const db = mongoose.connection.db;
  
  // Remove comments that reference non-existent posts
  const posts = await db.collection('posts').find().map(p => p._id).toArray();
  const deletedComments = await db.collection('comments').deleteMany({
    postId: { $nin: posts }
  });
  
  if (deletedComments.deletedCount > 0) {
    console.log(`🗑️  Removed ${deletedComments.deletedCount} orphaned comments`);
  }
  
  // Remove comments that reference non-existent users
  const users = await db.collection('users').find().map(u => u._id).toArray();
  const deletedUserComments = await db.collection('comments').deleteMany({
    authorId: { $nin: users }
  });
  
  if (deletedUserComments.deletedCount > 0) {
    console.log(`🗑️  Removed ${deletedUserComments.deletedCount} comments with non-existent authors`);
  }
  
  console.log('✅ Cleanup completed');
}

async function generateMigrationReport() {
  console.log('📊 Generating migration report...');
  
  const db = mongoose.connection.db;
  
  const stats = await db.stats();
  const collections = await db.listCollections().toArray();
  
  console.log(`📈 Database Statistics:`);
  console.log(`  - Database: ${stats.db}`);
  console.log(`  - Collections: ${collections.length}`);
  console.log(`  - Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  - Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
  
  for (const collection of collections) {
    const count = await db.collection(collection.name).countDocuments();
    console.log(`  - ${collection.name}: ${count} documents`);
  }
}

async function main() {
  console.log('🚀 Starting data migration script...\n');
  
  try {
    await connectToDatabase();
    
    await migrateUsers();
    await migrateProjects();
    await migratePosts();
    await migrateComments();
    await cleanupOrphanedData();
    await generateMigrationReport();
    
    console.log('\n✅ Data migration script completed successfully');
  } catch (error) {
    console.error('\n❌ Data migration script failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(console.error);
