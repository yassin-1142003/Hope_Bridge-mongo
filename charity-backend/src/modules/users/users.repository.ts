import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../../db/schemas/user.schema";

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  findAll() {
    return this.userModel.find().exec();
  }

  create(data: Partial<User>) {
    const doc = new this.userModel(data);
    return doc.save();
  }

  updateById(id: string, update: Partial<User>) {
    return this.userModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
  }

  deleteById(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
