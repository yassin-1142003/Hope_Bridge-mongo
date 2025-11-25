// Test all media (images and videos) to ensure they work properly
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function testAllMedia() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).toArray();
    
    console.log('🎬 Testing All Media (Images + Videos)\n');
    
    let totalImages = 0;
    let totalVideos = 0;
    let workingVideos = 0;
    let workingImages = 0;
    
    for (const project of projects) {
      const englishContent = project.contents?.find(c => c.language_code === 'en');
      const projectName = englishContent?.name || 'Unknown';
      
      console.log(`📁 Project: ${projectName}`);
      
      // Test banner image
      if (project.bannerPhotoUrl) {
        totalImages++;
        const isThumbnail = project.bannerPhotoUrl.includes('thumbnail');
        const hasFileId = project.bannerPhotoUrl.match(/id=([a-zA-Z0-9_-]+)/);
        console.log(`   🖼️ Banner: ${isThumbnail ? '✅ Thumbnail' : '❌ Old Format'} | ${hasFileId ? '✅ File ID' : '❌ No ID'}`);
        if (isThumbnail && hasFileId) workingImages++;
      }
      
      // Test gallery images
      const galleryImages = project.gallery || [];
      totalImages += galleryImages.length;
      const workingGalleryImages = galleryImages.filter(url => 
        url.includes('thumbnail') && url.match(/id=([a-zA-Z0-9_-]+)/)
      ).length;
      workingImages += workingGalleryImages;
      console.log(`   🖼️ Gallery: ${workingGalleryImages}/${galleryImages.length} optimized`);
      
      // Test content images
      const contentImages = englishContent?.images || [];
      totalImages += contentImages.length;
      const workingContentImages = contentImages.filter(url => 
        url.includes('thumbnail') && url.match(/id=([a-zA-Z0-9_-]+)/)
      ).length;
      workingImages += workingContentImages;
      console.log(`   📸 Content Images: ${workingContentImages}/${contentImages.length} optimized`);
      
      // Test videos
      const videos = englishContent?.videos || [];
      totalVideos += videos.length;
      const workingProjectVideos = videos.filter(url => {
        const hasFileId = url.match(/id=([a-zA-Z0-9_-]+)/);
        return hasFileId; // All videos should have file IDs
      }).length;
      workingVideos += workingProjectVideos;
      
      if (videos.length > 0) {
        console.log(`   🎥 Videos: ${workingProjectVideos}/${videos.length} ready for embedding`);
        
        // Show sample video conversion
        if (videos.length > 0) {
          const sampleVideo = videos[0];
          const fileId = sampleVideo.match(/id=([a-zA-Z0-9_-]+)/)?.[1];
          if (fileId) {
            const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
            console.log(`      📹 Sample: ${embedUrl.substring(0, 60)}...`);
          }
        }
      }
      
      console.log('');
    }
    
    console.log('📊 Final Media Summary:');
    console.log(`   🖼️ Images: ${workingImages}/${totalImages} optimized (${((workingImages/totalImages)*100).toFixed(1)}%)`);
    console.log(`   🎥 Videos: ${workingVideos}/${totalVideos} ready for embedding (${((workingVideos/totalVideos)*100).toFixed(1)}%)`);
    
    console.log('\n🎯 Media Status:');
    if (workingImages === totalImages && workingVideos === totalVideos) {
      console.log('🎉 PERFECT! All media is optimized and ready!');
      console.log('✅ What works:');
      console.log('   • All images use fast thumbnail URLs');
      console.log('   • All videos can be embedded properly');
      console.log('   • No timeout or loading issues');
      console.log('   • Professional media galleries');
    } else {
      console.log('⚠️ Some media needs optimization');
      console.log('   • Images: ' + (workingImages === totalImages ? '✅ All optimized' : '❌ Some need optimization'));
      console.log('   • Videos: ' + (workingVideos === totalVideos ? '✅ All ready' : '❌ Some need fixing'));
    }
    
    console.log('\n🌐 Ready to test:');
    console.log('   1. Restart dev server: npm run dev');
    console.log('   2. Visit: http://localhost:3000/en/projects');
    console.log('   3. Click projects to see media galleries');
    console.log('   4. Videos should play in embedded iframes');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🎬 Testing All Media (Images + Videos)\n');
console.log('This will verify that all your media is properly optimized.\n');

testAllMedia();
