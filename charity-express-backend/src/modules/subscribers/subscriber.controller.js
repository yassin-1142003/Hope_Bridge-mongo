import { subscribe } from "./subscriber.service.js";
import { sendSuccess } from "../../utils/response.js";

export async function postSubscribe(req, res) {
  const result = await subscribe(req.body);

  if (result.alreadySubscribed) {
    return sendSuccess(res, "Already subscribed", { subscribed: false });
  }

  return sendSuccess(res, "Subscribed successfully", { subscribed: true }, 201);
}
