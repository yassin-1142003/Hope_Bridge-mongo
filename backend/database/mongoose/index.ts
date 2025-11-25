import mongoose, { ClientSession } from "mongoose";
import { connectDb } from "./connection";
import { MongooseUOW } from "./MongooseUOW";
import { PostCategoryNameArr, PostMediaTypeNameArr } from "./enums";
import {
  UserModel,
  PostModel,
  ProjectModel,
  ContactModel,
  VisitModel,
} from "./models";

export type { PostCategoryName, PostMediaTypeName } from "./enums";
export type {
  UsrData,
  NewUsrData,
  Post,
  NewPost,
  Project,
  NewProject,
  Visit,
  NewVisit,
} from "./models";

export type DrizzleTransaction = ClientSession;

async function runTransaction<T>(fn: (session: ClientSession) => Promise<T>): Promise<T> {
  await connectDb();
  const session = await mongoose.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

const drizzlePgdb = {
  transaction: runTransaction,
};

class DrizzlePGUOW extends MongooseUOW {
  constructor(tx: DrizzleTransaction) {
    super(tx);
  }
}

export {
  // models & DTOs
  UserModel,
  PostModel,
  ProjectModel,
  ContactModel,
  VisitModel,
  // enums (runtime arrays only)
  PostCategoryNameArr,
  PostMediaTypeNameArr,
  // transaction shim
  DrizzlePGUOW,
  drizzlePgdb,
  MongooseUOW,
};
