"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const analytics_service_1 = require("./analytics.service");
const analytics_controller_1 = require("./analytics.controller");
const enhanced_project_schema_1 = require("../../db/schemas/enhanced-project.schema");
const enhanced_user_schema_1 = require("../../db/schemas/enhanced-user.schema");
const mongoose_2 = require("mongoose");
const VisitSchema = new mongoose_2.Schema({
    projectId: { type: mongoose_2.Schema.Types.ObjectId, ref: 'EnhancedProject', required: true },
    userId: { type: mongoose_2.Schema.Types.ObjectId, ref: 'EnhancedUser', default: null },
    path: { type: String, required: true },
    locale: { type: String, default: 'en' },
    referrer: { type: String, default: '' },
    userAgent: { type: String, required: true },
    userType: { type: String, enum: ['user', 'guest'], required: true },
    timestamp: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 },
    sessionId: { type: String, required: true },
    metadata: { type: mongoose_2.Schema.Types.Mixed, default: {} },
}, {
    timestamps: true,
    collection: 'visits'
});
VisitSchema.index({ projectId: 1, timestamp: -1 });
VisitSchema.index({ userId: 1, timestamp: -1 });
VisitSchema.index({ userType: 1, timestamp: -1 });
VisitSchema.index({ sessionId: 1 });
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: enhanced_project_schema_1.EnhancedProject.name, schema: enhanced_project_schema_1.EnhancedProjectSchema },
                { name: enhanced_user_schema_1.EnhancedUser.name, schema: enhanced_user_schema_1.EnhancedUserSchema },
                { name: 'Visit', schema: VisitSchema },
            ]),
        ],
        controllers: [analytics_controller_1.AnalyticsController],
        providers: [analytics_service_1.AnalyticsService],
        exports: [analytics_service_1.AnalyticsService],
    })
], AnalyticsModule);
//# sourceMappingURL=analytics.module.js.map