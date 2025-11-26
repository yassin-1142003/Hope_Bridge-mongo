import { connectMongo, getCollection } from './charity-express-backend/src/db/mongo.js';

async function testProjectCreation() {
  try {
    await connectMongo();
    console.log('Connected to MongoDB');

    const projects = getCollection('projects');
    
    // Test project creation with id: -1
    const testProject = {
      title: 'Test Project for ID -1',
      description: 'This project should have id: -1 and appear first in MongoDB Compass',
      link: 'https://example.com/test',
      image: 'https://example.com/test-image.jpg',
      createdAt: new Date(),
      id: -1
    };

    const insertResult = await projects.insertOne(testProject);
    console.log('Test project inserted with ID:', insertResult.insertedId.toString());
    
    // Query the project to verify
    const insertedProject = await projects.findOne({ _id: insertResult.insertedId });
    console.log('Retrieved project:', {
      _id: insertedProject._id.toString(),
      title: insertedProject.title,
      id: insertedProject.id,
      createdAt: insertedProject.createdAt
    });

    // Show all projects sorted by id to verify ordering
    const allProjects = await projects.find({}).sort({ id: 1 }).toArray();
    console.log('\nAll projects sorted by id:');
    allProjects.forEach(project => {
      console.log(`- ${project.title} (id: ${project.id})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

testProjectCreation();
