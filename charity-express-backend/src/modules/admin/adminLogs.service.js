import { getCollection } from "../../db/mongo.js";

export async function logAdminAction({ adminId, action, dataBefore, dataAfter }) {
  const adminLogs = getCollection("AdminLogs");

  const doc = {
    adminId: adminId || null,
    action,
    dataBefore: dataBefore ?? null,
    dataAfter: dataAfter ?? null,
    timestamp: new Date(),
  };

  await adminLogs.insertOne(doc);
  return doc;
}
