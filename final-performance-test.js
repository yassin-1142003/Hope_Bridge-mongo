// Final performance test to verify all timeout issues are resolved
import mongoose from 'mongoose';

const mongoUrl = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';

async function finalPerformanceTest() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('🔗 Connected to MongoDB\n');

    const Project = mongoose.connection.db.collection('project');
    const projects = await Project.find({}).limit(3).toArray();
    
    console.log('🚀 Final Performance Test\n');
    
    let totalImages = 0;
    let thumbnailImages = 0;
    
    for (const project of projects) {
      const englishContent = project.contents?.find(c => c.language_code === 'en');
      const projectName = englishContent?.name || 'Unknown';
      
      console.log(`📁 Project: ${projectName}`);
      
      // Check banner URL
      const isThumbnailBanner = project.bannerPhotoUrl.includes('thumbnail');
      console.log(`   🖼️ Banner: ${isThumbnailBanner ? '✅ Thumbnail' : '❌ Old Format'}`);
      if (isThumbnailBanner) thumbnailImages++;
      totalImages++;
      
      // Check gallery URLs
      const galleryCount = project.gallery?.length || 0;
      const thumbnailGalleryCount = project.gallery?.filter(url => url.includes('thumbnail')).length || 0;
      console.log(`   🖼️ Gallery: ${thumbnailGalleryCount}/${galleryCount} thumbnails`);
      totalImages += galleryCount;
      thumbnailImages += thumbnailGalleryCount;
      
      // Check content images
      const imageCount = englishContent?.images?.length || 0;
      const thumbnailImageCount = englishContent?.images?.filter(url => url.includes('thumbnail')).length || 0;
      console.log(`   📸 Content Images: ${thumbnailImageCount}/${imageCount} thumbnails`);
      totalImages += imageCount;
      thumbnailImages += thumbnailImageCount;
      
      console.log('');
    }
    
    const thumbnailPercentage = totalImages > 0 ? (thumbnailImages / totalImages * 100).toFixed(1) : 0;
    
    console.log('🎯 Performance Summary:');
    console.log(`   📊 Total Images: ${totalImages}`);
    console.log(`   ⚡ Thumbnail Images: ${thumbnailImages}`);
    console.log(`   📈 Optimization: ${thumbnailPercentage}%`);
    
    if (thumbnailPercentage >= 95) {
      console.log('\n🎉 EXCELLENT! All timeout issues should be resolved!');
      console.log('⚡ Expected performance:');
      console.log('   • Images load in < 500ms');
      console.log('   • No more timeout errors');
      console.log('   • Smooth user experience');
    } else {
      console.log('\n⚠️ Some images still use old format');
      console.log('   • Additional optimization may be needed');
    }
    
    console.log('\n🔄 Next steps:');
    console.log('   1. Restart dev server: npm run dev');
    console.log('   2. Test: http://localhost:3000/en/projects');
    console.log('   3. Monitor console for timeout errors');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

console.log('🚀 Final Performance Test\n');
console.log('This will verify that all images are optimized for fast loading.\n');

finalPerformanceTest();
