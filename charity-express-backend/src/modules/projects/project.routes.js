import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  postProject,
  listProjects,
  getProject,
} from "./project.controller.js";

export const projectRouter = express.Router();

// Admin can add projects: POST /api/projects
projectRouter.post("/", asyncHandler(postProject));

// Public list: GET /api/projects
projectRouter.get("/", asyncHandler(listProjects));

// Single project: GET /api/projects/:id
projectRouter.get("/:id", asyncHandler(getProject));
