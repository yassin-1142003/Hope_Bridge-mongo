import { ClientSession } from "mongoose";
import { NewUsrData, UsrData, UserModel, toUsrData } from "../models";

class UsrRepo {
  constructor(private session: ClientSession | null = null) {}

  async findOneByEmail(email: string): Promise<UsrData | undefined> {
    const doc = await UserModel
      .findOne({ email })
      .session(this.session ?? undefined);
    return doc ? toUsrData(doc) : undefined;
  }

  async findOneById(id: string): Promise<UsrData | undefined> {
    const doc = await UserModel
      .findById(id)
      .session(this.session ?? undefined);
    return doc ? toUsrData(doc) : undefined;
  }

  async saveOne(usr: NewUsrData): Promise<UsrData> {
    const [doc] = await UserModel.create([usr], {
      session: this.session ?? undefined,
    });
    return toUsrData(doc);
  }

  async getAll(): Promise<UsrData[]> {
    const docs = await UserModel.find()
      .session(this.session ?? undefined);
    return docs.map(toUsrData);
  }
}

export { UsrRepo };
