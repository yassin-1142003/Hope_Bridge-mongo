import bcrypt from "bcrypt";
import { DrizzlePGUOW, drizzlePgdb } from "@/backend/database";
import { AppError } from "@/backend/errorHandler";
import { type NewUsrData, type UsrData } from "@/backend/database/mongoose/models";

export interface UsrSignupData {
  firstName: string;
  lastName?: string;
  email: string;
  hash: string;
  role: string;
}

class UsrManager {
  async signup(usr: UsrSignupData): Promise<UsrData> {
    const newUsr = await drizzlePgdb.transaction(async (tx) => {
      const uow = new DrizzlePGUOW(tx);

      const existing = await uow.usrRepo.findOneByEmail(usr.email);
      if (existing) {
        throw new AppError(
          "ERR_DATA_ALREADY_EXIST",
          "This email is used",
          { email: usr.email },
        );
      }

      const hashed = await bcrypt.hash(usr.hash, 10);
      const toSave: NewUsrData = {
        email: usr.email,
        hash: hashed,
        firstName: usr.firstName,
        lastName: usr.lastName ?? null,
        role: usr.role,
      };

      return uow.usrRepo.saveOne(toSave);
    });

    return newUsr;
  }
}

export { UsrManager };
