import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { listUpdates } from "./updates.controller.js";

export const updatesRouter = express.Router();

// Public updates list: GET /api/updates
updatesRouter.get("/", asyncHandler(listUpdates));
