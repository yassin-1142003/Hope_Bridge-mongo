import { MongoClient } from 'mongodb';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hope-bridge';
const dbName = MONGODB_URI.split('/').pop().split('?')[0] || 'hope-bridge';

async function addSampleMedia() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const mediaCollection = db.collection('media');

    // Sample media data (without actual files)
    const sampleMedia = [
      {
        title: 'Charity Event 2024',
        description: 'Annual charity fundraising event with volunteers and beneficiaries',
        alt: 'Charity fundraising event with people gathering',
        filename: 'charity-event-2024.jpg',
        originalName: 'charity-event.jpg',
        mimeType: 'image/jpeg',
        size: 2048576, // 2MB
        type: 'image',
        category: 'event',
        url: '/uploads/charity-event-2024.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Project Completion Video',
        description: 'Time-lapse video of our latest community project completion',
        alt: 'Project completion time-lapse video',
        filename: 'project-completion-2024.mp4',
        originalName: 'project-timelapse.mp4',
        mimeType: 'video/mp4',
        size: 10485760, // 10MB
        type: 'video',
        category: 'project',
        url: '/uploads/project-completion-2024.mp4',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Team Photo',
        description: 'Our dedicated team of volunteers and staff members',
        alt: 'Team photo of HopeBridge volunteers',
        filename: 'team-photo-2024.jpg',
        originalName: 'team.jpg',
        mimeType: 'image/jpeg',
        size: 1536000, // 1.5MB
        type: 'image',
        category: 'team',
        url: '/uploads/team-photo-2024.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'News Banner',
        description: 'Banner image for latest news announcement',
        alt: 'HopeBridge news banner',
        filename: 'news-banner-2024.jpg',
        originalName: 'news-banner.jpg',
        mimeType: 'image/jpeg',
        size: 512000, // 500KB
        type: 'image',
        category: 'banner',
        url: '/uploads/news-banner-2024.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Gallery Showcase',
        description: 'Beautiful photo from our community garden project',
        alt: 'Community garden showcase photo',
        filename: 'gallery-garden.jpg',
        originalName: 'garden-photo.jpg',
        mimeType: 'image/jpeg',
        size: 3072000, // 3MB
        type: 'image',
        category: 'gallery',
        url: '/uploads/gallery-garden.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert sample media
    const result = await mediaCollection.insertMany(sampleMedia);
    
    console.log(`✅ Successfully added ${result.insertedCount} sample media items to database`);
    console.log('📁 Sample media includes:');
    sampleMedia.forEach((media, index) => {
      console.log(`  ${index + 1}. ${media.title} (${media.type} - ${media.category})`);
    });

  } catch (error) {
    console.error('❌ Error adding sample media:', error);
  } finally {
    await client.close();
  }
}

// Run the function
addSampleMedia().catch(console.error);
