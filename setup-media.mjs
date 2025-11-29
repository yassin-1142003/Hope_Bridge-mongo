import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

async function setupMediaSystem() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }
  
  console.log('🔗 Setting up media system...');
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    const db = client.db();
    const mediaCollection = db.collection('media');
    
    // Check for existing media
    const existingMedia = await mediaCollection.countDocuments();
    console.log(`📁 Found ${existingMedia} existing media files`);
    
    // Add sample media records for local files
    const sampleMedia = [
      {
        name: 'Homepage Hero 1',
        filename: '01.webp',
        path: 'homepage/01.webp',
        url: '/homepage/01.webp',
        type: 'image',
        mimeType: 'image/webp',
        size: 102400, // ~100KB
        alt: 'Hope Bridge Project Hero Image',
        category: 'homepage',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Homepage Hero 2',
        filename: '02.webp',
        path: 'homepage/02.webp',
        url: '/homepage/02.webp',
        type: 'image',
        mimeType: 'image/webp',
        size: 102400,
        alt: 'Community Project Image',
        category: 'homepage',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Homepage Hero 3',
        filename: '03.webp',
        path: 'homepage/03.webp',
        url: '/homepage/03.webp',
        type: 'image',
        mimeType: 'image/webp',
        size: 102400,
        alt: 'Education Initiative Image',
        category: 'homepage',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'About Us Hero',
        filename: 'hero.webp',
        path: 'aboutus/hero.webp',
        url: '/aboutus/hero.webp',
        type: 'image',
        mimeType: 'image/webp',
        size: 102400,
        alt: 'About Hope Bridge',
        category: 'about',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'About Us Hero 2',
        filename: 'hero2.webp',
        path: 'aboutus/hero2.webp',
        url: '/aboutus/hero2.webp',
        type: 'image',
        mimeType: 'image/webp',
        size: 102400,
        alt: 'Team Working Together',
        category: 'about',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'About Us Hero 3',
        filename: 'hero3.webp',
        path: 'aboutus/hero3.webp',
        url: '/aboutus/hero3.webp',
        type: 'image',
        mimeType: 'image/webp',
        size: 102400,
        alt: 'Community Impact',
        category: 'about',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Insert sample media if collection is empty
    if (existingMedia === 0) {
      console.log('📝 Adding sample media records...');
      const result = await mediaCollection.insertMany(sampleMedia);
      console.log(`✅ Added ${result.insertedCount} sample media records`);
    } else {
      console.log('📁 Media collection already has data');
    }
    
    // Check if local files exist
    const publicDir = path.join(process.cwd(), 'public');
    const requiredFiles = [
      'homepage/01.webp',
      'homepage/02.webp', 
      'homepage/03.webp',
      'aboutus/hero.webp',
      'aboutus/hero2.webp',
      'aboutus/hero3.webp'
    ];
    
    console.log('🔍 Checking local files...');
    let missingFiles = [];
    
    for (const file of requiredFiles) {
      const filePath = path.join(publicDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ Found: ${file}`);
      } else {
        console.log(`❌ Missing: ${file}`);
        missingFiles.push(file);
      }
    }
    
    if (missingFiles.length > 0) {
      console.log(`⚠️  ${missingFiles.length} files are missing. You may need to add images to your public folder.`);
      console.log('📝 Required folders: public/homepage/ and public/aboutus/');
    } else {
      console.log('✅ All required local files found!');
    }
    
    // Update projects to use local paths if they have external URLs
    const projectsCollection = db.collection('projects');
    const projects = await projectsCollection.find({}).toArray();
    
    console.log('🔄 Updating projects to use local paths...');
    let updatedProjects = 0;
    
    for (const project of projects) {
      let needsUpdate = false;
      let updateData = {};
      
      // Update bannerPhotoUrl if it's external
      if (project.bannerPhotoUrl && project.bannerPhotoUrl.startsWith('http')) {
        updateData.bannerPhotoUrl = '/homepage/01.webp';
        needsUpdate = true;
      }
      
      // Update imageGallery if it contains external URLs
      if (project.imageGallery && Array.isArray(project.imageGallery)) {
        const updatedGallery = project.imageGallery.map((url) => {
          if (url.startsWith('http')) {
            return '/homepage/01.webp';
          }
          return url;
        });
        updateData.imageGallery = updatedGallery;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await projectsCollection.updateOne(
          { _id: project._id },
          { $set: { ...updateData, updatedAt: new Date() } }
        );
        updatedProjects++;
      }
    }
    
    if (updatedProjects > 0) {
      console.log(`✅ Updated ${updatedProjects} projects to use local images`);
    } else {
      console.log('📁 Projects already use local paths');
    }
    
    console.log('🎯 Media system setup complete!');
    
  } catch (error) {
    console.error('❌ Setup error:', error);
  } finally {
    await client.close();
  }
}

setupMediaSystem();
