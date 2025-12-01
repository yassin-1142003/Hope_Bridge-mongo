import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const uri = config.get<string>("MONGODB_URI");
        if (!uri) {
          throw new Error("MONGODB_URI is not defined in environment");
        }
        return {
          uri,
        };
      },
    }),
  ],
})
export class MongooseConfigModule {}
