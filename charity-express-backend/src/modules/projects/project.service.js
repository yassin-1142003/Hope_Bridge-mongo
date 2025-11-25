import { z } from "zod";
import { getCollection } from "../../db/mongo.js";
import { sendNewProjectEmail } from "../../config/email.js";

const ProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  link: z.string().url().optional(),
  image: z.string().url().optional(),
});

export async function createProject(body) {
  const data = ProjectSchema.parse(body);

  const projects = getCollection("projects");
  const subscribers = getCollection("subscribers");
  const notifications = getCollection("notifications");

  const insertResult = await projects.insertOne({
    ...data,
    createdAt: new Date(),
  });

  const project = { _id: insertResult.insertedId, ...data };

  // Fetch all subscribers and build email list
  const cursor = subscribers.find({}, { projection: { email: 1 } });
  const allSubscribers = await cursor.toArray();
  const emails = allSubscribers.map((s) => s.email);

  // Store notification document
  if (emails.length > 0) {
    await notifications.insertOne({
      title: `New Charity Project: ${data.title}`,
      message: data.description,
      userEmailsSent: emails,
      createdAt: new Date(),
    });
  }

  // Send emails (in parallel)
  await Promise.all(emails.map((email) => sendNewProjectEmail(email, project)));

  return project;
}

export async function getProjects() {
  const projects = getCollection("projects");
  const list = await projects
    .find({}, { sort: { createdAt: -1 } })
    .toArray();
  return list;
}

export async function getProjectById(id) {
  const projects = getCollection("projects");
  const { ObjectId } = await import("mongodb");

  let objectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return null;
  }

  const project = await projects.findOne({ _id: objectId });
  return project;
}
