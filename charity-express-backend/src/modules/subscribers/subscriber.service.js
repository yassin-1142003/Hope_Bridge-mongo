import { z } from "zod";
import { getCollection } from "../../db/mongo.js";

const SubscribeSchema = z.object({
  email: z.string().email(),
});

export async function subscribe(body) {
  const { email } = SubscribeSchema.parse(body);

  const subscribers = getCollection("subscribers");

  const existing = await subscribers.findOne({ email });
  if (existing) {
    return { alreadySubscribed: true };
  }

  await subscribers.insertOne({
    email,
    createdAt: new Date(),
  });

  return { alreadySubscribed: false };
}
