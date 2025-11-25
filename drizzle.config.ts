import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Legacy Drizzle config - kept only so TypeScript compiles. Not used at runtime.
const dbUrl = process.env.DATABASE_URL ?? "postgres://placeholder";

export default defineConfig({
  out: "./backend/drizzleMigrations",
  schema: [],
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});

