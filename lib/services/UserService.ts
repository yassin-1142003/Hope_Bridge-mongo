import { UserModel, UsrData, NewUsrData, toUsrData } from "@/backend/database/mongoose/models";
import { connectDb } from "@/backend/database/mongoose/connection";
import bcrypt from "bcrypt";

export class UserService {
  async createUser(data: NewUsrData): Promise<UsrData> {
    await connectDb();
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw new Error("This email is already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.hash, 10);
    const userData = {
      ...data,
      hash: hashedPassword
    };

    const user = new UserModel(userData);
    const savedUser = await user.save();
    return toUsrData(savedUser);
  }

  async getAllUsers(): Promise<UsrData[]> {
    await connectDb();
    const users = await UserModel.find().sort({ created_at: -1 });
    return users.map(toUsrData);
  }

  async getUserById(id: string): Promise<UsrData | null> {
    await connectDb();
    const user = await UserModel.findById(id);
    return user ? toUsrData(user) : null;
  }

  async getUserByEmail(email: string): Promise<UsrData | null> {
    await connectDb();
    const user = await UserModel.findOne({ email });
    return user ? toUsrData(user) : null;
  }

  async updateUser(id: string, data: Partial<NewUsrData>): Promise<UsrData | null> {
    await connectDb();
    
    // If password is being updated, hash it
    if (data.hash) {
      data.hash = await bcrypt.hash(data.hash, 10);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return updatedUser ? toUsrData(updatedUser) : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    await connectDb();
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  async verifyPassword(email: string, password: string): Promise<UsrData | null> {
    await connectDb();
    const user = await UserModel.findOne({ email });
    if (!user) return null;

    const isValidPassword = await bcrypt.compare(password, user.hash);
    if (!isValidPassword) return null;

    return toUsrData(user);
  }
}
