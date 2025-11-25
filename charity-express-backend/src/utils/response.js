import { ZodError } from "zod";

export function sendSuccess(res, message, data = null, status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export function sendError(res, message, status = 500, errors = []) {
  return res.status(status).json({ success: false, message, errors });
}

export function notFoundHandler(req, res, next) {
  return sendError(res, "Not Found", 404);
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);
  if (res.headersSent) {
    return;
  }
  if (err instanceof ZodError) {
    return sendError(res, "Validation error", 400, err.errors);
  }

  return sendError(res, err.message || "Internal server error", err.status || 500);
}
