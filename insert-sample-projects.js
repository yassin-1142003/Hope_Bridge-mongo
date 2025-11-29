import { MongoClient } from 'mongodb';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hope-bridge';
const dbName = MONGODB_URI.split('/').pop().split('?')[0] || 'hope-bridge';

async function insertSampleProjectsWithImages() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const projectsCollection = db.collection('projects');

    // Sample projects with image and video arrays
    const sampleProjects = [
      {
        title: "Community Garden Project",
        description: "Transforming unused spaces into thriving community gardens",
        shortDescription: "Urban gardening initiative",
        status: "active",
        category: "community",
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        // Image arrays - different ways to store images
        bannerPhotoUrl: "/uploads/community-garden-banner.jpg",
        
        // Gallery images array
        gallery: [
          {
            id: "img_001",
            url: "/uploads/garden-before.jpg",
            alt: "Garden space before transformation",
            caption: "Before we started"
          },
          {
            id: "img_002", 
            url: "/uploads/garden-during.jpg",
            alt: "Volunteers working in garden",
            caption: "Community volunteers at work"
          },
          {
            id: "img_003",
            url: "/uploads/garden-after.jpg", 
            alt: "Completed community garden",
            caption: "Beautiful results"
          }
        ],
        
        // Additional images array
        images: [
          "/uploads/garden-team-photo.jpg",
          "/uploads/garden-harvest.jpg",
          "/uploads/garden-ceremony.jpg"
        ],
        
        // Video array
        videos: [
          {
            id: "vid_001",
            url: "/uploads/garden-timelapse.mp4",
            thumbnail: "/uploads/garden-timelapse-thumb.jpg",
            title: "Garden Transformation Timelapse",
            duration: "2:30",
            description: "Watch our garden grow from start to finish"
          },
          {
            id: "vid_002",
            url: "/uploads/volunteer-testimonials.mp4", 
            thumbnail: "/uploads/testimonials-thumb.jpg",
            title: "Volunteer Stories",
            duration: "4:15",
            description: "Hear from our amazing volunteers"
          }
        ],
        
        // Media metadata
        mediaCount: {
          images: 6,
          videos: 2,
          total: 8
        },
        
        // Project details
        location: "Downtown Community Center",
        startDate: new Date('2024-03-01'),
        completionDate: new Date('2024-06-01'),
        volunteers: 45,
        impact: "Served 200+ families with fresh produce"
      },
      
      {
        title: "Youth Education Initiative",
        description: "Providing educational resources and mentorship to underprivileged youth",
        shortDescription: "Education empowerment program",
        status: "active", 
        category: "education",
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        bannerPhotoUrl: "/uploads/education-banner.jpg",
        
        gallery: [
          {
            id: "img_004",
            url: "/uploads/classroom-session.jpg",
            alt: "Students in classroom",
            caption: "Daily learning sessions"
          },
          {
            id: "img_005",
            url: "/uploads/tutoring-session.jpg", 
            alt: "One-on-one tutoring",
            caption: "Personalized attention"
          },
          {
            id: "img_006",
            url: "/uploads/graduation-ceremony.jpg",
            alt: "Student graduation ceremony", 
            caption: "Celebrating achievements"
          },
          {
            id: "img_007",
            url: "/uploads/stem-activities.jpg",
            alt: "STEM learning activities",
            caption: "Hands-on science learning"
          }
        ],
        
        images: [
          "/uploads/education-center-exterior.jpg",
          "/uploads/library-facility.jpg",
          "/uploads/computer-lab.jpg",
          "/uploads/study-groups.jpg"
        ],
        
        videos: [
          {
            id: "vid_003",
            url: "/uploads/student-success-stories.mp4",
            thumbnail: "/uploads/success-stories-thumb.jpg", 
            title: "Student Success Stories",
            duration: "5:45",
            description: "Hear how education changed lives"
          }
        ],
        
        mediaCount: {
          images: 8,
          videos: 1,
          total: 9
        },
        
        location: "East Side Learning Center",
        startDate: new Date('2024-01-15'),
        ongoing: true,
        students: 120,
        tutors: 15,
        impact: "95% graduation rate, 80% college enrollment"
      },
      
      {
        title: "Clean Water Project",
        description: "Installing water purification systems in rural communities",
        shortDescription: "Access to clean water",
        status: "completed",
        category: "health",
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        bannerPhotoUrl: "/uploads/water-project-banner.jpg",
        
        gallery: [
          {
            id: "img_008",
            url: "/uploads/water-installation.jpg",
            alt: "Water purification system installation",
            caption: "Installing purification units"
          },
          {
            id: "img_009",
            url: "/uploads/clean-water-collection.jpg",
            alt: "Community collecting clean water",
            caption: "First clean water access"
          },
          {
            id: "img_010",
            url: "/uploads/water-testing.jpg",
            alt: "Water quality testing",
            caption: "Ensuring water safety"
          }
        ],
        
        images: [
          "/uploads/water-source-before.jpg",
          "/uploads/implementation-team.jpg",
          "/uploads/community-training.jpg"
        ],
        
        videos: [
          {
            id: "vid_004",
            url: "/uploads/water-project-documentary.mp4",
            thumbnail: "/uploads/water-doc-thumb.jpg",
            title: "Clean Water Documentary",
            duration: "8:20", 
            description: "The journey to clean water access"
          },
          {
            id: "vid_005",
            url: "/uploads/community-reaction.mp4",
            thumbnail: "/uploads/community-reaction-thumb.jpg",
            title: "Community Reactions",
            duration: "3:10",
            description: "See the impact on families"
          }
        ],
        
        mediaCount: {
          images: 6,
          videos: 2,
          total: 8
        },
        
        location: "Rural Communities - 3 Villages",
        startDate: new Date('2023-10-01'),
        completionDate: new Date('2024-02-28'),
        beneficiaries: 1500,
        systems: 12,
        impact: "Clean water access for 1500+ people daily"
      }
    ];

    // Insert sample projects
    const result = await projectsCollection.insertMany(sampleProjects);
    
    console.log(`✅ Successfully inserted ${result.insertedCount} sample projects with images and videos`);
    console.log('\n📊 Project Breakdown:');
    
    sampleProjects.forEach((project, index) => {
      console.log(`\n🎯 Project ${index + 1}: ${project.title}`);
      console.log(`   📸 Images: ${project.images.length} (simple array)`);
      console.log(`   🖼️ Gallery: ${project.gallery.length} (detailed objects)`);
      console.log(`   🎥 Videos: ${project.videos.length} (detailed objects)`);
      console.log(`   🌄 Banner: ${project.bannerPhotoUrl}`);
      console.log(`   📼 Total Media: ${project.mediaCount.total}`);
      
      // Show sample structure
      if (project.gallery.length > 0) {
        console.log(`   📋 Sample Gallery Item:`);
        console.log(`      - ID: ${project.gallery[0].id}`);
        console.log(`      - URL: ${project.gallery[0].url}`);
        console.log(`      - Alt: ${project.gallery[0].alt}`);
        console.log(`      - Caption: ${project.gallery[0].caption}`);
      }
      
      if (project.videos.length > 0) {
        console.log(`   📋 Sample Video Item:`);
        console.log(`      - ID: ${project.videos[0].id}`);
        console.log(`      - URL: ${project.videos[0].url}`);
        console.log(`      - Title: ${project.videos[0].title}`);
        console.log(`      - Duration: ${project.videos[0].duration}`);
      }
    });

    console.log('\n🗄️ MongoDB Structure Examples:');
    console.log('\n1. Simple Image Array:');
    console.log('   images: ["image1.jpg", "image2.jpg", "image3.jpg"]');
    
    console.log('\n2. Detailed Gallery Objects:');
    console.log('   gallery: [{');
    console.log('     id: "img_001",');
    console.log('     url: "/uploads/garden-before.jpg",');
    console.log('     alt: "Garden before transformation",');
    console.log('     caption: "Before we started"');
    console.log('   }]');
    
    console.log('\n3. Video Objects with Metadata:');
    console.log('   videos: [{');
    console.log('     id: "vid_001",');
    console.log('     url: "/uploads/timelapse.mp4",');
    console.log('     thumbnail: "/uploads/thumb.jpg",');
    console.log('     title: "Project Timelapse",');
    console.log('     duration: "2:30",');
    console.log('     description: "Watch the transformation"');
    console.log('   }]');

  } catch (error) {
    console.error('❌ Error inserting sample projects:', error);
  } finally {
    await client.close();
  }
}

// Run the function
insertSampleProjectsWithImages().catch(console.error);
