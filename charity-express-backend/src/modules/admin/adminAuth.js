import { env } from "../../config/env.js";
import { sendError } from "../../utils/response.js";

export function requireAdminKey(req, res, next) {
  // If no ADMIN_API_KEY is set, allow all (useful for local dev)
  if (!env.ADMIN_API_KEY) {
    return next();
  }

  const headerKey = req.headers["x-admin-key"];

  if (typeof headerKey === "string" && headerKey === env.ADMIN_API_KEY) {
    return next();
  }

  return sendError(res, "Unauthorized", 401);
}
