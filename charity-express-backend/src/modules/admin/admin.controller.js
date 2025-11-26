import { z } from "zod";
import { getCollection } from "../../db/mongo.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { logAdminAction } from "./adminLogs.service.js";
import { sendAnnouncementEmail } from "../../config/email.js";

function getAdminId(req) {
  const headerId = req.headers["x-admin-id"];
  if (typeof headerId === "string" && headerId.trim() !== "") {
    return headerId.trim();
  }
  return "admin";
}

async function toObjectId(id) {
  const { ObjectId } = await import("mongodb");
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

const CharitySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  link: z.string().url().optional(),
  image: z.string().url().optional(),
});

const CharityUpdateSchema = CharitySchema.partial();

const AnnouncementSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
});

export async function getAdminStats(req, res) {
  const projects = getCollection("projects");
  const subscribers = getCollection("subscribers");
  const notifications = getCollection("notifications");
  const adminLogs = getCollection("AdminLogs");

  const [projectsCount, subscribersCount, notificationsCount, adminLogsCount] =
    await Promise.all([
      projects.countDocuments(),
      subscribers.countDocuments(),
      notifications.countDocuments(),
      adminLogs.countDocuments(),
    ]);

  return sendSuccess(res, "Admin stats fetched", {
    projects: projectsCount,
    subscribers: subscribersCount,
    notifications: notificationsCount,
    adminLogs: adminLogsCount,
  });
}

export async function createCharity(req, res) {
  const adminId = getAdminId(req);
  const body = CharitySchema.parse(req.body);

  const projects = getCollection("projects");

  const insertResult = await projects.insertOne({
    ...body,
    status: "active",
    createdAt: new Date(),
    id: -1,
  });

  const charity = { _id: insertResult.insertedId, ...body, status: "active", id: -1 };

  await logAdminAction({
    adminId,
    action: "addCharity",
    dataBefore: null,
    dataAfter: charity,
  });

  return sendSuccess(res, "Charity created", charity, 201);
}

export async function updateCharity(req, res) {
  const adminId = getAdminId(req);
  const body = CharityUpdateSchema.parse(req.body);

  const projects = getCollection("projects");
  const objectId = await toObjectId(req.params.id);
  if (!objectId) {
    return sendError(res, "Invalid charity id", 400);
  }

  const before = await projects.findOne({ _id: objectId });
  if (!before) {
    return sendError(res, "Charity not found", 404);
  }

  await projects.updateOne({ _id: objectId }, { $set: body });
  const after = await projects.findOne({ _id: objectId });

  await logAdminAction({
    adminId,
    action: "updateCharity",
    dataBefore: before,
    dataAfter: after,
  });

  return sendSuccess(res, "Charity updated", after);
}

export async function deleteCharity(req, res) {
  const adminId = getAdminId(req);
  const projects = getCollection("projects");
  const objectId = await toObjectId(req.params.id);
  if (!objectId) {
    return sendError(res, "Invalid charity id", 400);
  }

  const before = await projects.findOne({ _id: objectId });
  if (!before) {
    return sendError(res, "Charity not found", 404);
  }

  await projects.deleteOne({ _id: objectId });

  await logAdminAction({
    adminId,
    action: "deleteCharity",
    dataBefore: before,
    dataAfter: null,
  });

  return sendSuccess(res, "Charity deleted", null);
}

export async function freezeCharity(req, res) {
  const adminId = getAdminId(req);
  const projects = getCollection("projects");
  const objectId = await toObjectId(req.params.id);
  if (!objectId) {
    return sendError(res, "Invalid charity id", 400);
  }

  const before = await projects.findOne({ _id: objectId });
  if (!before) {
    return sendError(res, "Charity not found", 404);
  }

  await projects.updateOne({ _id: objectId }, { $set: { status: "frozen" } });
  const after = await projects.findOne({ _id: objectId });

  await logAdminAction({
    adminId,
    action: "freezeCharity",
    dataBefore: before,
    dataAfter: after,
  });

  return sendSuccess(res, "Charity frozen", after);
}

export async function listSubscribersAdmin(req, res) {
  const subscribers = getCollection("subscribers");
  const list = await subscribers.find().sort({ createdAt: -1 }).toArray();
  return sendSuccess(res, "Subscribers fetched", list);
}

export async function listNotificationsAdmin(req, res) {
  const notifications = getCollection("notifications");
  const list = await notifications.find().sort({ createdAt: -1 }).toArray();
  return sendSuccess(res, "Notifications fetched", list);
}

export async function createAnnouncement(req, res) {
  const adminId = getAdminId(req);
  const body = AnnouncementSchema.parse(req.body);

  const notifications = getCollection("notifications");
  const subscribers = getCollection("subscribers");

  const cursor = subscribers.find({}, { projection: { email: 1 } });
  const allSubscribers = await cursor.toArray();
  const emails = allSubscribers.map((s) => s.email);

  const insertResult = await notifications.insertOne({
    title: body.title,
    message: body.message,
    userEmailsSent: emails,
    createdAt: new Date(),
  });

  // send emails (fire and forget, but wait here is fine as it's admin-triggered)
  await Promise.all(emails.map((email) => sendAnnouncementEmail(email, body)));

  const notification = { _id: insertResult.insertedId, ...body, userEmailsSent: emails };

  await logAdminAction({
    adminId,
    action: "createAnnouncement",
    dataBefore: null,
    dataAfter: notification,
  });

  return sendSuccess(res, "Announcement created", notification, 201);
}

export async function listAdminLogs(req, res) {
  const adminLogs = getCollection("AdminLogs");
  const list = await adminLogs.find().sort({ timestamp: -1 }).toArray();
  return sendSuccess(res, "Admin logs fetched", list);
}
