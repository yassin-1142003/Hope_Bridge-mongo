import { connectMongo, getCollection } from "./db/mongo.js";

async function run() {
  const db = await connectMongo();
  console.log("Connected to MongoDB for seeding:", db.databaseName);

  const subscribers = getCollection("subscribers");
  const projects = getCollection("projects");
  const notifications = getCollection("notifications");
  const adminLogs = getCollection("AdminLogs");

  // Seed subscribers (idempotent)
  const seedSubscribers = [
    "demo.user1@example.com",
    "demo.user2@example.com",
  ];

  for (const email of seedSubscribers) {
    const existing = await subscribers.findOne({ email });
    if (!existing) {
      await subscribers.insertOne({ email, createdAt: new Date() });
      console.log("Inserted subscriber", email);
    }
  }

  // Seed a sample project with resourceImage path
  const seedProjectTitle = "Seed Charity Project";
  let project = await projects.findOne({ title: seedProjectTitle });
  if (!project) {
    const insertResult = await projects.insertOne({
      title: seedProjectTitle,
      description: "Seed project to verify API and email flow.",
      link: "https://example.com/seed-project",
      image: "/mnt/data/9d6267be-4dc7-400a-8ee3-c952a7db1931.png",
      status: "active",
      createdAt: new Date(),
    });
    project = { _id: insertResult.insertedId, title: seedProjectTitle };
    console.log("Inserted seed project", project._id.toString());
  } else {
    console.log("Seed project already exists", project._id.toString());
  }

  // Seed a notification linked to that project
  const notifTitle = "Seed Notification";
  const existingNotif = await notifications.findOne({ title: notifTitle });
  const allSubs = await subscribers.find({}, { projection: { email: 1 } }).toArray();
  const emails = allSubs.map((s) => s.email);

  if (!existingNotif) {
    await notifications.insertOne({
      title: notifTitle,
      message: "This is a seeded notification for testing.",
      userEmailsSent: emails,
      createdAt: new Date(),
      projectId: project._id,
    });
    console.log("Inserted seed notification");
  } else {
    console.log("Seed notification already exists");
  }

  // Seed an admin log entry
  const seedLogAction = "seedInitialData";
  const existingLog = await adminLogs.findOne({ action: seedLogAction });
  if (!existingLog) {
    await adminLogs.insertOne({
      adminId: "seed-script",
      action: seedLogAction,
      dataBefore: null,
      dataAfter: { projectId: project._id },
      timestamp: new Date(),
    });
    console.log("Inserted seed admin log");
  } else {
    console.log("Seed admin log already exists");
  }

  console.log("Seeding completed");
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed", err);
    process.exit(1);
  });
