import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EnhancedUser, EnhancedUserSchema } from "../../db/schemas/enhanced-user.schema";
import { UsersService } from "./users.service";
import { UsersRepository } from "./users.repository";
import { UsersController } from "./users.controller";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EnhancedUser.name, schema: EnhancedUserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
