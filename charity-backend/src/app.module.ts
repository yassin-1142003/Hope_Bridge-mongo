import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseConfigModule } from "./db/mongoose.module";
import { validateEnv } from "./config/zod-env";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    MongooseConfigModule,
    AuthModule,
    UsersModule,
    // TODO: import other modules (projects, donations, posts, comments, notifications, files, admin)
  ],
})
export class AppModule {}
