import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  PORT: z.string().default("4000"),
  MONGO_URI: z.string().url(),
  SMTP_EMAIL: z.string().email(),
  SMTP_PASSWORD: z.string().min(1),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.string().default("587"),
  ADMIN_API_KEY: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
  SMTP_NAME: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment variables", parsed.error.format());
  throw new Error("Invalid environment variables for Express backend");
}

export const env = parsed.data;
