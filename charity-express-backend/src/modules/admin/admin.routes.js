import express from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAdminKey } from "./adminAuth.js";
import {
  getAdminStats,
  createCharity,
  updateCharity,
  deleteCharity,
  freezeCharity,
  listSubscribersAdmin,
  listNotificationsAdmin,
  createAnnouncement,
  listAdminLogs,
} from "./admin.controller.js";

export const adminRouter = express.Router();

// Admin-specific rate limiter (stricter than global)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// All routes under /api/admin require the admin key
adminRouter.use(adminLimiter);
adminRouter.use(requireAdminKey);

// Stats
adminRouter.get("/stats", asyncHandler(getAdminStats));

// Charity management
adminRouter.post("/charities", asyncHandler(createCharity));
adminRouter.patch("/charities/:id", asyncHandler(updateCharity));
adminRouter.delete("/charities/:id", asyncHandler(deleteCharity));
adminRouter.patch("/charities/:id/freeze", asyncHandler(freezeCharity));

// Subscribers & notifications
adminRouter.get("/subscribers", asyncHandler(listSubscribersAdmin));
adminRouter.get("/notifications", asyncHandler(listNotificationsAdmin));
adminRouter.post("/announcements", asyncHandler(createAnnouncement));

// Admin logs
adminRouter.get("/logs", asyncHandler(listAdminLogs));
