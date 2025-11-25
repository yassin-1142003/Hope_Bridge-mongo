import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { postSubscribe } from "./subscriber.controller.js";

export const subscriberRouter = express.Router();

subscriberRouter.post("/notify/subscribe", asyncHandler(postSubscribe));
