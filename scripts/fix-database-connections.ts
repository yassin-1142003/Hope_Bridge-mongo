#!/usr/bin/env ts-node

/**
 * Database Connection Fix Script
 * Fixes common MongoDB connection issues and validates configuration
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0,
    });

    console.log('✅ MongoDB connection successful');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections`);
    
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });

    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Provide specific fixes based on error type
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Fix: Check your MongoDB hostname and network connection');
    } else if (error.message.includes('ENETUNREACH')) {
      console.log('💡 Fix: Check your internet connection');
    } else if (error.message.includes('auth')) {
      console.log('💡 Fix: Check your MongoDB credentials');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Fix: Check MongoDB server status and firewall settings');
    }
    
    return false;
  }
}

async function fixIndexes() {
  try {
    console.log('🔧 Checking and fixing database indexes...');
    
    const db = mongoose.connection.db;
    
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ isActive: 1 });
    console.log('✅ Users collection indexes fixed');
    
    // Projects collection indexes
    await db.collection('projects').createIndex({ title: 'text', description: 'text' });
    await db.collection('projects').createIndex({ isActive: 1 });
    await db.collection('projects').createIndex({ createdAt: -1 });
    console.log('✅ Projects collection indexes fixed');
    
    // Posts collection indexes
    await db.collection('posts').createIndex({ slug: 1 }, { unique: true });
    await db.collection('posts').createIndex({ category: 1 });
    await db.collection('posts').createIndex({ status: 1 });
    await db.collection('posts').createIndex({ isActive: 1 });
    console.log('✅ Posts collection indexes fixed');
    
    // Comments collection indexes
    await db.collection('comments').createIndex({ postId: 1 });
    await db.collection('comments').createIndex({ parentId: 1 });
    await db.collection('comments').createIndex({ authorId: 1 });
    await db.collection('comments').createIndex({ isDeleted: 1 });
    console.log('✅ Comments collection indexes fixed');
    
  } catch (error) {
    console.error('❌ Error fixing indexes:', error.message);
  }
}

async function validateData() {
  try {
    console.log('🔍 Validating data integrity...');
    
    const db = mongoose.connection.db;
    
    // Check for duplicate emails
    const duplicateEmails = await db.collection('users').aggregate([
      { $group: { _id: '$email', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    if (duplicateEmails.length > 0) {
      console.log('⚠️  Found duplicate emails:', duplicateEmails);
    } else {
      console.log('✅ No duplicate emails found');
    }
    
    // Check for orphaned comments
    const orphanedComments = await db.collection('comments').find({
      postId: { $nin: await db.collection('posts').find().map(p => p._id).toArray() }
    }).toArray();
    
    if (orphanedComments.length > 0) {
      console.log('⚠️  Found orphaned comments:', orphanedComments.length);
    } else {
      console.log('✅ No orphaned comments found');
    }
    
  } catch (error) {
    console.error('❌ Error validating data:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting database fix script...\n');
  
  const connectionSuccess = await testConnection();
  
  if (connectionSuccess) {
    await fixIndexes();
    await validateData();
    console.log('\n✅ Database fix script completed successfully');
  } else {
    console.log('\n❌ Database fix script failed. Please check the errors above.');
  }
  
  await mongoose.disconnect();
  process.exit(connectionSuccess ? 0 : 1);
}

main().catch(console.error);
