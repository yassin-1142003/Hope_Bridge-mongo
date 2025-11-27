#!/usr/bin/env ts-node

/**
 * Media URL Fix Script
 * Fixes broken media URLs and optimizes media storage
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

interface Project {
  _id: string;
  title: string;
  bannerPhotoUrl?: string;
  contents: Array<{
    type: 'text' | 'image' | 'video';
    data: string;
    order: number;
  }>;
}

interface Post {
  _id: string;
  title: string;
  slug: string;
  images?: string[];
  videos?: string[];
  contents: Array<{
    type: string;
    data: string;
    order: number;
  }>;
}

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not found in environment variables');
  }
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');
}

async function checkUrl(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function fixProjectMedia() {
  console.log('🔧 Fixing project media URLs...');
  
  const db = mongoose.connection.db;
  const projects = await db.collection('projects').find({}).toArray() as Project[];
  
  let fixedCount = 0;
  
  for (const project of projects) {
    let needsUpdate = false;
    const updatedProject = { ...project };
    
    // Check banner photo URL
    if (project.bannerPhotoUrl && !(await checkUrl(project.bannerPhotoUrl))) {
      console.log(`⚠️  Broken banner URL in project "${project.title}": ${project.bannerPhotoUrl}`);
      updatedProject.bannerPhotoUrl = '';
      needsUpdate = true;
    }
    
    // Check contents media URLs
    const updatedContents = [];
    for (const content of project.contents) {
      if ((content.type === 'image' || content.type === 'video') && content.data) {
        if (await checkUrl(content.data)) {
          updatedContents.push(content);
        } else {
          console.log(`⚠️  Broken ${content.type} URL in project "${project.title}": ${content.data}`);
          needsUpdate = true;
        }
      } else {
        updatedContents.push(content);
      }
    }
    
    if (needsUpdate) {
      updatedProject.contents = updatedContents;
      await db.collection('projects').updateOne(
        { _id: project._id },
        { $set: updatedProject }
      );
      fixedCount++;
    }
  }
  
  console.log(`✅ Fixed ${fixedCount} projects with broken media URLs`);
}

async function fixPostMedia() {
  console.log('🔧 Fixing post media URLs...');
  
  const db = mongoose.connection.db;
  const posts = await db.collection('posts').find({}).toArray() as Post[];
  
  let fixedCount = 0;
  
  for (const post of posts) {
    let needsUpdate = false;
    const updatedPost = { ...post };
    
    // Check images array
    if (post.images && post.images.length > 0) {
      const validImages = [];
      for (const imageUrl of post.images) {
        if (await checkUrl(imageUrl)) {
          validImages.push(imageUrl);
        } else {
          console.log(`⚠️  Broken image URL in post "${post.title}": ${imageUrl}`);
          needsUpdate = true;
        }
      }
      updatedPost.images = validImages;
    }
    
    // Check videos array
    if (post.videos && post.videos.length > 0) {
      const validVideos = [];
      for (const videoUrl of post.videos) {
        if (await checkUrl(videoUrl)) {
          validVideos.push(videoUrl);
        } else {
          console.log(`⚠️  Broken video URL in post "${post.title}": ${videoUrl}`);
          needsUpdate = true;
        }
      }
      updatedPost.videos = validVideos;
    }
    
    // Check contents media URLs
    const updatedContents = [];
    for (const content of post.contents || []) {
      if ((content.type === 'image' || content.type === 'video') && content.data) {
        if (await checkUrl(content.data)) {
          updatedContents.push(content);
        } else {
          console.log(`⚠️  Broken ${content.type} URL in post "${post.title}": ${content.data}`);
          needsUpdate = true;
        }
      } else {
        updatedContents.push(content);
      }
    }
    
    if (needsUpdate) {
      updatedPost.contents = updatedContents;
      await db.collection('posts').updateOne(
        { _id: post._id },
        { $set: updatedPost }
      );
      fixedCount++;
    }
  }
  
  console.log(`✅ Fixed ${fixedCount} posts with broken media URLs`);
}

async function optimizeMediaUrls() {
  console.log('🚀 Optimizing media URLs...');
  
  const db = mongoose.connection.db;
  
  // Convert relative URLs to absolute URLs
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hopebridge.example.com';
  
  const projects = await db.collection('projects').find({}).toArray();
  let optimizedCount = 0;
  
  for (const project of projects as Project[]) {
    let needsUpdate = false;
    const updatedProject = { ...project };
    
    // Fix banner photo URL
    if (project.bannerPhotoUrl && !project.bannerPhotoUrl.startsWith('http')) {
      updatedProject.bannerPhotoUrl = `${baseUrl}${project.bannerPhotoUrl}`;
      needsUpdate = true;
    }
    
    // Fix contents media URLs
    const updatedContents = [];
    for (const content of project.contents) {
      if ((content.type === 'image' || content.type === 'video') && content.data) {
        if (!content.data.startsWith('http')) {
          updatedContents.push({
            ...content,
            data: `${baseUrl}${content.data}`
          });
          needsUpdate = true;
        } else {
          updatedContents.push(content);
        }
      } else {
        updatedContents.push(content);
      }
    }
    
    if (needsUpdate) {
      updatedProject.contents = updatedContents;
      await db.collection('projects').updateOne(
        { _id: project._id },
        { $set: updatedProject }
      );
      optimizedCount++;
    }
  }
  
  console.log(`✅ Optimized ${optimizedCount} project media URLs`);
}

async function generateMediaReport() {
  console.log('📊 Generating media report...');
  
  const db = mongoose.connection.db;
  
  // Count media files
  const projects = await db.collection('projects').find({}).toArray();
  const posts = await db.collection('posts').find({}).toArray();
  
  let totalImages = 0;
  let totalVideos = 0;
  let brokenUrls = 0;
  
  // Count project media
  for (const project of projects as Project[]) {
    if (project.bannerPhotoUrl) totalImages++;
    for (const content of project.contents) {
      if (content.type === 'image') totalImages++;
      else if (content.type === 'video') totalVideos++;
    }
  }
  
  // Count post media
  for (const post of posts as Post[]) {
    if (post.images) totalImages += post.images.length;
    if (post.videos) totalVideos += post.videos.length;
    for (const content of post.contents || []) {
      if (content.type === 'image') totalImages++;
      else if (content.type === 'video') totalVideos++;
    }
  }
  
  console.log(`📈 Media Statistics:`);
  console.log(`  - Total Images: ${totalImages}`);
  console.log(`  - Total Videos: ${totalVideos}`);
  console.log(`  - Total Projects: ${projects.length}`);
  console.log(`  - Total Posts: ${posts.length}`);
  console.log(`  - Broken URLs: ${brokenUrls}`);
}

async function main() {
  console.log('🚀 Starting media URL fix script...\n');
  
  try {
    await connectToDatabase();
    
    await fixProjectMedia();
    await fixPostMedia();
    await optimizeMediaUrls();
    await generateMediaReport();
    
    console.log('\n✅ Media URL fix script completed successfully');
  } catch (error) {
    console.error('\n❌ Media URL fix script failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(console.error);
