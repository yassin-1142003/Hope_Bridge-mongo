import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { EnhancedUser, EnhancedUserSchema } from "./schemas/enhanced-user.schema";
import { EnhancedProject, EnhancedProjectSchema } from "./schemas/enhanced-project.schema";
import { Donation, DonationSchema } from "./schemas/donation.schema";
import { Task, TaskSchema } from "./schemas/task.schema";
import { Comment, CommentSchema } from "./schemas/comment.schema";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const uri = config.get<string>("MONGODB_URI") || 'mongodb://localhost:27017/charity';
        console.log(`🔗 Connecting to MongoDB: ${uri}`);
        
        return {
          uri,
          // Enhanced connection options for better performance
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              console.log('✅ MongoDB connected successfully');
            });
            connection.on('error', (error: any) => {
              console.error('❌ MongoDB connection error:', error);
            });
            connection.on('disconnected', () => {
              console.log('⚠️ MongoDB disconnected');
            });
            return connection;
          },
        };
      },
    }),
    // Register all schemas with Mongoose
    MongooseModule.forFeature([
      { name: EnhancedUser.name, schema: EnhancedUserSchema },
      { name: EnhancedProject.name, schema: EnhancedProjectSchema },
      { name: Donation.name, schema: DonationSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  exports: [
    MongooseModule,
    // Export schemas for use in other modules
    MongooseModule.forFeature([
      { name: EnhancedUser.name, schema: EnhancedUserSchema },
      { name: EnhancedProject.name, schema: EnhancedProjectSchema },
      { name: Donation.name, schema: DonationSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
})
export class MongooseConfigModule {}
