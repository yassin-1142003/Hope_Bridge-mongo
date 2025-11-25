import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";

neonConfig.fetchConnectionCache = true;

const pool = new Pool({
  connectionString:process.env.PGDATABASE_URL
});

export const db = drizzle(pool);