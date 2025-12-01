import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsController } from "./analytics.controller";
import { EnhancedProject, EnhancedProjectSchema } from "../../db/schemas/enhanced-project.schema";
import { EnhancedUser, EnhancedUserSchema } from "../../db/schemas/enhanced-user.schema";

// Visit tracking schema
import { Schema } from "mongoose";

const VisitSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'EnhancedProject', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'EnhancedUser', default: null },
  path: { type: String, required: true },
  locale: { type: String, default: 'en' },
  referrer: { type: String, default: '' },
  userAgent: { type: String, required: true },
  userType: { type: String, enum: ['user', 'guest'], required: true },
  timestamp: { type: Date, default: Date.now },
  duration: { type: Number, default: 0 }, // Time spent on page in seconds
  sessionId: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, {
  timestamps: true,
  collection: 'visits'
});

// Indexes for performance
VisitSchema.index({ projectId: 1, timestamp: -1 });
VisitSchema.index({ userId: 1, timestamp: -1 });
VisitSchema.index({ userType: 1, timestamp: -1 });
VisitSchema.index({ sessionId: 1 });

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EnhancedProject.name, schema: EnhancedProjectSchema },
      { name: EnhancedUser.name, schema: EnhancedUserSchema },
      { name: 'Visit', schema: VisitSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
