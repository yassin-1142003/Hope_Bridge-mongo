"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseConfigModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const enhanced_user_schema_1 = require("./schemas/enhanced-user.schema");
const enhanced_project_schema_1 = require("./schemas/enhanced-project.schema");
const donation_schema_1 = require("./schemas/donation.schema");
const task_schema_1 = require("./schemas/task.schema");
const comment_schema_1 = require("./schemas/comment.schema");
let MongooseConfigModule = class MongooseConfigModule {
};
exports.MongooseConfigModule = MongooseConfigModule;
exports.MongooseConfigModule = MongooseConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: async (config) => {
                    const uri = config.get("MONGODB_URI") || 'mongodb://localhost:27017/charity';
                    console.log(`🔗 Connecting to MongoDB: ${uri}`);
                    return {
                        uri,
                        connectionFactory: (connection) => {
                            connection.on('connected', () => {
                                console.log('✅ MongoDB connected successfully');
                            });
                            connection.on('error', (error) => {
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
            mongoose_1.MongooseModule.forFeature([
                { name: enhanced_user_schema_1.EnhancedUser.name, schema: enhanced_user_schema_1.EnhancedUserSchema },
                { name: enhanced_project_schema_1.EnhancedProject.name, schema: enhanced_project_schema_1.EnhancedProjectSchema },
                { name: donation_schema_1.Donation.name, schema: donation_schema_1.DonationSchema },
                { name: task_schema_1.Task.name, schema: task_schema_1.TaskSchema },
                { name: comment_schema_1.Comment.name, schema: comment_schema_1.CommentSchema },
            ]),
        ],
        exports: [
            mongoose_1.MongooseModule,
            mongoose_1.MongooseModule.forFeature([
                { name: enhanced_user_schema_1.EnhancedUser.name, schema: enhanced_user_schema_1.EnhancedUserSchema },
                { name: enhanced_project_schema_1.EnhancedProject.name, schema: enhanced_project_schema_1.EnhancedProjectSchema },
                { name: donation_schema_1.Donation.name, schema: donation_schema_1.DonationSchema },
                { name: task_schema_1.Task.name, schema: task_schema_1.TaskSchema },
                { name: comment_schema_1.Comment.name, schema: comment_schema_1.CommentSchema },
            ]),
        ],
    })
], MongooseConfigModule);
//# sourceMappingURL=mongoose.module.js.map