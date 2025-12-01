"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedProjectSchema = exports.EnhancedProject = exports.ProjectContentSchema = exports.ProjectContent = exports.ProjectCategory = exports.ProjectStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["DRAFT"] = "draft";
    ProjectStatus["ACTIVE"] = "active";
    ProjectStatus["COMPLETED"] = "completed";
    ProjectStatus["SUSPENDED"] = "suspended";
    ProjectStatus["CANCELLED"] = "cancelled";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var ProjectCategory;
(function (ProjectCategory) {
    ProjectCategory["EDUCATION"] = "education";
    ProjectCategory["HEALTH"] = "health";
    ProjectCategory["FOOD"] = "food";
    ProjectCategory["SHELTER"] = "shelter";
    ProjectCategory["WATER"] = "water";
    ProjectCategory["EMERGENCY"] = "emergency";
    ProjectCategory["INFRASTRUCTURE"] = "infrastructure";
    ProjectCategory["AGRICULTURE"] = "agriculture";
    ProjectCategory["TECHNOLOGY"] = "technology";
    ProjectCategory["OTHER"] = "other";
})(ProjectCategory || (exports.ProjectCategory = ProjectCategory = {}));
let ProjectContent = class ProjectContent {
};
exports.ProjectContent = ProjectContent;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 2 }),
    __metadata("design:type", String)
], ProjectContent.prototype, "language_code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 200 }),
    __metadata("design:type", String)
], ProjectContent.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 500 }),
    __metadata("design:type", String)
], ProjectContent.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ProjectContent.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ProjectContent.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ProjectContent.prototype, "videos", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ProjectContent.prototype, "documents", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 100 }),
    __metadata("design:type", Array)
], ProjectContent.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ProjectContent.prototype, "metaDescription", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ProjectContent.prototype, "metaKeywords", void 0);
exports.ProjectContent = ProjectContent = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ProjectContent);
exports.ProjectContentSchema = mongoose_1.SchemaFactory.createForClass(ProjectContent);
let EnhancedProject = class EnhancedProject {
};
exports.EnhancedProject = EnhancedProject;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], EnhancedProject.prototype, "bannerPhotoUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], EnhancedProject.prototype, "imageGallery", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], EnhancedProject.prototype, "videoGallery", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ProjectContentSchema], required: true }),
    __metadata("design:type", Array)
], EnhancedProject.prototype, "contents", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ProjectStatus,
        default: ProjectStatus.DRAFT,
        index: true
    }),
    __metadata("design:type", String)
], EnhancedProject.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ProjectCategory,
        required: true,
        index: true
    }),
    __metadata("design:type", String)
], EnhancedProject.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        unique: true,
        index: true
    }),
    __metadata("design:type", String)
], EnhancedProject.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 0 }),
    __metadata("design:type", Number)
], EnhancedProject.prototype, "targetAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0 }),
    __metadata("design:type", Number)
], EnhancedProject.prototype, "currentAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'AED', 'SAR'],
        default: 'USD'
    }),
    __metadata("design:type", String)
], EnhancedProject.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0 }),
    __metadata("design:type", Number)
], EnhancedProject.prototype, "donorCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], EnhancedProject.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], EnhancedProject.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], EnhancedProject.prototype, "actualEndDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 200 }),
    __metadata("design:type", String)
], EnhancedProject.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], EnhancedProject.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], EnhancedProject.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: -90, max: 90 }),
    __metadata("design:type", Number)
], EnhancedProject.prototype, "latitude", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: -180, max: 180 }),
    __metadata("design:type", Number)
], EnhancedProject.prototype, "longitude", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EnhancedProject.prototype, "projectManager", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.Types.ObjectId], ref: 'EnhancedUser', default: [] }),
    __metadata("design:type", Array)
], EnhancedProject.prototype, "teamMembers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.Types.ObjectId], ref: 'EnhancedUser', default: [] }),
    __metadata("design:type", Array)
], EnhancedProject.prototype, "volunteers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.Types.ObjectId], ref: 'EnhancedUser', default: [] }),
    __metadata("design:type", Array)
], EnhancedProject.prototype, "donors", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0 }),
    __metadata("design:type", Number)
], EnhancedProject.prototype, "beneficiariesCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0 }),
    __metadata("design:type", Number)
], EnhancedProject.prototype, "volunteerHours", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0, max: 100 }),
    __metadata("design:type", Number)
], EnhancedProject.prototype, "completionPercentage", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
        index: true
    }),
    __metadata("design:type", String)
], EnhancedProject.prototype, "priority", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], EnhancedProject.prototype, "isFeatured", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], EnhancedProject.prototype, "isVisible", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], EnhancedProject.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], EnhancedProject.prototype, "skills", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], EnhancedProject.prototype, "externalLinks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], EnhancedProject.prototype, "websiteUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], EnhancedProject.prototype, "socialMediaUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], EnhancedProject.prototype, "contactEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 20 }),
    __metadata("design:type", String)
], EnhancedProject.prototype, "contactPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], EnhancedProject.prototype, "documents", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], EnhancedProject.prototype, "reports", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], EnhancedProject.prototype, "certificates", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EnhancedProject.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EnhancedProject.prototype, "updatedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], EnhancedProject.prototype, "approvedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], EnhancedProject.prototype, "approvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, select: false }),
    __metadata("design:type", Boolean)
], EnhancedProject.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, select: false }),
    __metadata("design:type", Date)
], EnhancedProject.prototype, "deletedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser', select: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EnhancedProject.prototype, "deletedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                action: String,
                description: String,
                userId: { type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser' },
                timestamp: { type: Date, default: Date.now }
            }],
        default: []
    }),
    __metadata("design:type", Array)
], EnhancedProject.prototype, "activityLog", void 0);
exports.EnhancedProject = EnhancedProject = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: "projects",
        toJSON: {
            transform: function (doc, ret) {
                if (ret.__v)
                    delete ret.__v;
                return ret;
            }
        }
    })
], EnhancedProject);
exports.EnhancedProjectSchema = mongoose_1.SchemaFactory.createForClass(EnhancedProject);
exports.EnhancedProjectSchema.index({ slug: 1 }, { unique: true });
exports.EnhancedProjectSchema.index({ status: 1, createdAt: -1 });
exports.EnhancedProjectSchema.index({ category: 1, status: 1 });
exports.EnhancedProjectSchema.index({ isFeatured: 1, status: 1 });
exports.EnhancedProjectSchema.index({ isVisible: 1, status: 1 });
exports.EnhancedProjectSchema.index({ priority: 1, status: 1 });
exports.EnhancedProjectSchema.index({ projectManager: 1 });
exports.EnhancedProjectSchema.index({ teamMembers: 1 });
exports.EnhancedProjectSchema.index({ volunteers: 1 });
exports.EnhancedProjectSchema.index({ donors: 1 });
exports.EnhancedProjectSchema.index({ startDate: -1 });
exports.EnhancedProjectSchema.index({ endDate: -1 });
exports.EnhancedProjectSchema.index({ createdAt: -1 });
exports.EnhancedProjectSchema.index({ updatedAt: -1 });
exports.EnhancedProjectSchema.index({ latitude: 1, longitude: 1 }, { sparse: true });
exports.EnhancedProjectSchema.index({ category: 1, status: 1, isFeatured: 1 });
exports.EnhancedProjectSchema.index({ status: 1, isVisible: 1, createdAt: -1 });
exports.EnhancedProjectSchema.index({ priority: 1, status: 1, createdAt: -1 });
exports.EnhancedProjectSchema.index({ city: 1, country: 1, status: 1 });
exports.EnhancedProjectSchema.index({
    'contents.title': 'text',
    'contents.description': 'text',
    'contents.content': 'text',
    location: 'text',
    city: 'text',
    country: 'text',
    tags: 'text'
});
exports.EnhancedProjectSchema.index({ targetAmount: -1 });
exports.EnhancedProjectSchema.index({ currentAmount: -1 });
exports.EnhancedProjectSchema.index({ donorCount: -1 });
exports.EnhancedProjectSchema.virtual('progressPercentage').get(function () {
    if (!this.targetAmount || this.targetAmount <= 0)
        return 0;
    return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
});
exports.EnhancedProjectSchema.virtual('daysRemaining').get(function () {
    const today = new Date();
    const endDate = new Date(this.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});
exports.EnhancedProjectSchema.virtual('isOverdue').get(function () {
    return new Date() > new Date(this.endDate) && this.status !== ProjectStatus.COMPLETED;
});
exports.EnhancedProjectSchema.virtual('fundingStatus').get(function () {
    if (!this.targetAmount || this.targetAmount <= 0)
        return 'just_started';
    const percentage = Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
    if (percentage >= 100)
        return 'completed';
    if (percentage >= 75)
        return 'nearly_complete';
    if (percentage >= 50)
        return 'half_funded';
    if (percentage >= 25)
        return 'quarter_funded';
    return 'just_started';
});
exports.EnhancedProjectSchema.pre('save', function (next) {
    if (this.isModified('currentAmount') || this.isModified('targetAmount')) {
        if (!this.targetAmount || this.targetAmount <= 0) {
            this.completionPercentage = 0;
        }
        else {
            this.completionPercentage = Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
        }
    }
    if (this.isModified('endDate') || this.isModified('startDate')) {
        const now = new Date();
        if (now < this.startDate && this.status === ProjectStatus.ACTIVE) {
            this.status = ProjectStatus.DRAFT;
        }
        else if (now > this.endDate && this.status === ProjectStatus.ACTIVE) {
            this.status = ProjectStatus.COMPLETED;
            this.actualEndDate = now;
        }
    }
    next();
});
exports.EnhancedProjectSchema.pre(/^find/, function (next) {
    if (!this.getQuery().includeDeleted) {
        this.find({ isDeleted: { $ne: true } });
    }
    next();
});
//# sourceMappingURL=enhanced-project.schema.js.map