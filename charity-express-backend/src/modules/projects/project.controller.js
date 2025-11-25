import { createProject, getProjects, getProjectById } from "./project.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export async function postProject(req, res) {
  const project = await createProject(req.body);
  return sendSuccess(res, "Project created and notifications sent", project, 201);
}

export async function listProjects(req, res) {
  const projects = await getProjects();
  return sendSuccess(res, "Projects fetched", projects);
}

export async function getProject(req, res) {
  const project = await getProjectById(req.params.id);
  if (!project) {
    return sendError(res, "Project not found", 404);
  }
  return sendSuccess(res, "Project fetched", project);
}
