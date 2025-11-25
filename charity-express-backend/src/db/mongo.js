import { MongoClient } from "mongodb";
import { env } from "../config/env.js";

let client;
let db;

export async function connectMongo() {
  if (db) return db;

  client = new MongoClient(env.MONGO_URI);
  await client.connect();
  db = client.db("charity");
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("MongoDB not connected. Call connectMongo() first.");
  }
  return db;
}

export function getCollection(name) {
  return getDb().collection(name);
}
