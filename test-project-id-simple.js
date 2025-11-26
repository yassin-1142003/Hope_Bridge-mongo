import { MongoClient } from 'mongodb';

async function testProjectCreation() {
  try {
    const mongoUri = 'mongodb+srv://mz:OROscKkxZy1jd4gY@cluster0.t9f9zti.mongodb.net/charity';
    const client = new MongoClient(mongoUri);
    
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('charity');
    const projects = db.collection('projects');
    
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
    console.log('Test project inserted with _id:', insertResult.insertedId.toString());
    
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
    console.log('\nAll projects sorted by id (ascending):');
    allProjects.forEach(project => {
      console.log(`- ${project.title} (id: ${project.id})`);
    });

    // Also show sorted by id descending to see -1 first
    const projectsDesc = await projects.find({}).sort({ id: -1 }).toArray();
    console.log('\nAll projects sorted by id (descending, -1 should be first):');
    projectsDesc.forEach(project => {
      console.log(`- ${project.title} (id: ${project.id})`);
    });

    await client.close();
    console.log('\nMongoDB connection closed');

  } catch (error) {
    console.error('Error:', error);
  }
}

testProjectCreation();
