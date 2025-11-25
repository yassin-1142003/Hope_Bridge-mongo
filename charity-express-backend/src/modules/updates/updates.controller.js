import { getCollection } from "../../db/mongo.js";
import { sendSuccess } from "../../utils/response.js";

export async function listUpdates(req, res) {
  const notifications = getCollection("notifications");
  const list = await notifications
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  return sendSuccess(res, "Updates fetched", list);
}
