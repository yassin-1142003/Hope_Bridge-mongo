import mongoose from "mongoose";

const mongoUrl =
  process.env.MONGODB_URI ??
  process.env.MONGODB_LOCAL_URI ??
  "mongodb://127.0.0.1:27017/hopebridge";

let cached: Promise<typeof mongoose> | null = null;

export async function connectDb(): Promise<typeof mongoose> {
  if (!cached) {
    mongoose.set("strictQuery", true);
    cached = mongoose.connect(mongoUrl);
  }
  return cached;
}
