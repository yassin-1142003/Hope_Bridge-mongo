#!/usr/bin/env ts-node

/**
 * Migration Script: Move Images and Videos from Content to Main Schema
 * 
 * This script migrates project data by moving images and videos from the nested
 * content structure to the main schema level for better performance and organization.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

interface ProjectContent {
  type: 'text' | 'image' | 'video';
  data: string;
  order: number;
  language_code?: string;
  name?: string;
  description?: string;
  content?: string;
}

interface Project {
  _id: string;
  title: string;
  description?: string;
  bannerPhotoUrl?: string;
  imageGallery?: string[];
  videoGallery?: string[];
  contents?: ProjectContent[];
}

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not found in environment variables');
  }
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');
}

async function migrateProjectMedia() {
  console.log('🔄 Starting project media migration...');
  
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }
  
  const projects = await db.collection('projects').find({}).toArray() as unknown as Project[];
  
  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const project of projects) {
    try {
      // Check if project has contents with media
      if (!project.contents || project.contents.length === 0) {
        skippedCount++;
        continue;
      }
      
      // Extract images and videos from contents
      const extractedImages: string[] = [];
      const extractedVideos: string[] = [];
      const updatedContents: ProjectContent[] = [];
      
      for (const content of project.contents) {
        if (content.type === 'image' && content.data) {
          extractedImages.push(content.data);
        } else if (content.type === 'video' && content.data) {
          extractedVideos.push(content.data);
        } else {
          // Keep non-media content
          updatedContents.push(content);
        }
      }
      
      // Only update if we found media to migrate
      if (extractedImages.length > 0 || extractedVideos.length > 0) {
        // Merge with existing gallery arrays
        const existingImages = project.imageGallery || [];
        const existingVideos = project.videoGallery || [];
        
        // Combine arrays, avoiding duplicates
        const allImages = [...new Set([...existingImages, ...extractedImages])];
        const allVideos = [...new Set([...existingVideos, ...extractedVideos])];
        
        // Update the project
        const updateData: any = {
          contents: updatedContents.length > 0 ? updatedContents : undefined
        };
        
        // Only update imageGallery if we have new images
        if (allImages.length > 0) {
          updateData.imageGallery = allImages;
        }
        
        // Only update videoGallery if we have new videos
        if (allVideos.length > 0) {
          updateData.videoGallery = allVideos;
        }
        
        // Remove undefined fields
        if (updateData.contents === undefined) {
          delete updateData.contents;
        }
        
        await db.collection('projects').updateOne(
          { _id: new mongoose.Types.ObjectId(project._id) },
          { $set: updateData }
        );
        
        console.log(`📸 Migrated project "${project.title}":`);
        console.log(`   - Images: ${extractedImages.length} (total: ${allImages.length})`);
        console.log(`   - Videos: ${extractedVideos.length} (total: ${allVideos.length})`);
        console.log(`   - Remaining content items: ${updatedContents.length}`);
        
        migratedCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.error(`❌ Error migrating project "${project.title}":`, error);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`   - Total projects: ${projects.length}`);
  console.log(`   - Migrated: ${migratedCount}`);
  console.log(`   - Skipped: ${skippedCount}`);
  console.log(`   - Errors: ${errorCount}`);
}

async function validateMigration() {
  console.log('\n🔍 Validating migration...');
  
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }
  
  const projects = await db.collection('projects').find({}).toArray() as unknown as Project[];
  
  let totalImages = 0;
  let totalVideos = 0;
  let mediaInContent = 0;
  
  for (const project of projects) {
    // Count media in main schema
    if (project.imageGallery) {
      totalImages += project.imageGallery.length;
    }
    if (project.videoGallery) {
      totalVideos += project.videoGallery.length;
    }
    
    // Check for remaining media in content
    if (project.contents) {
      for (const content of project.contents) {
        if (content.type === 'image' || content.type === 'video') {
          mediaInContent++;
        }
      }
    }
  }
  
  console.log(`📈 Post-Migration Statistics:`);
  console.log(`   - Total images in main schema: ${totalImages}`);
  console.log(`   - Total videos in main schema: ${totalVideos}`);
  console.log(`   - Media items remaining in content: ${mediaInContent}`);
  
  if (mediaInContent === 0) {
    console.log('✅ Migration successful - all media moved to main schema');
  } else {
    console.log(`⚠️  ${mediaInContent} media items still remain in content field`);
  }
}

async function createBackup() {
  console.log('💾 Creating backup before migration...');
  
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }
  
  const projects = await db.collection('projects').find({}).toArray();
  
  // Create backup collection
  await db.collection('projects_backup').drop().catch(() => {}); // Ignore if doesn't exist
  await db.collection('projects_backup').insertMany(projects);
  
  console.log(`✅ Backup created with ${projects.length} projects`);
}

async function main() {
  console.log('🚀 Starting Project Media Migration...\n');
  
  try {
    await connectToDatabase();
    
    // Create backup before migration
    await createBackup();
    
    // Perform migration
    await migrateProjectMedia();
    
    // Validate results
    await validateMigration();
    
    console.log('\n✅ Project Media Migration completed successfully');
    console.log('💡 Tip: Run this script again if you need to re-migrate or check results');
    console.log('🔄 To restore from backup, use: db.projects_backup.find().forEach(doc => db.projects.insertOne(doc))');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(console.error);

export { migrateProjectMedia, main };
