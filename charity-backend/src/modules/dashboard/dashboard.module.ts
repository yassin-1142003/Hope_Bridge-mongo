import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { EnhancedProject, EnhancedProjectSchema } from "../../db/schemas/enhanced-project.schema";
import { EnhancedUser, EnhancedUserSchema } from "../../db/schemas/enhanced-user.schema";
import { Donation, DonationSchema } from "../../db/schemas/donation.schema";
import { Task, TaskSchema } from "../../db/schemas/task.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EnhancedProject.name, schema: EnhancedProjectSchema },
      { name: EnhancedUser.name, schema: EnhancedUserSchema },
      { name: Donation.name, schema: DonationSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
