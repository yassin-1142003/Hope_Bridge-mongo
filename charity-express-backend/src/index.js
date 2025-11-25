import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectMongo } from "./db/mongo.js";
import { env } from "./config/env.js";
import { subscriberRouter } from "./modules/subscribers/subscriber.routes.js";
import { projectRouter } from "./modules/projects/project.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";
import { updatesRouter } from "./modules/updates/updates.routes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./utils/response.js";

export async function createApp() {
  await connectMongo();

  const app = express();

  app.use(helmet());

  // CORS: allow configured origin if provided, otherwise allow all (dev-friendly)
  if (env.CORS_ORIGIN) {
    app.use(
      cors({
        origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
      }),
    );
  } else {
    app.use(cors());
  }

  app.use(express.json());
  app.use(morgan("dev"));

  // Global basic rate limiter
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(globalLimiter);

  app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "OK" });
  });

  app.use("/api/subscribers", subscriberRouter);
  app.use("/api/projects", projectRouter);
  app.use("/api/updates", updatesRouter);
  app.use("/api/admin", adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export async function startServer() {
  const app = await createApp();
  const port = Number(env.PORT || 4000);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Charity Express backend listening on http://localhost:${port}`);
  });
}
