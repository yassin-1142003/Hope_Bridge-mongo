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
exports.TaskSchema = exports.Task = exports.TaskCategory = exports.TaskPriority = exports.TaskStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "todo";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["IN_REVIEW"] = "in_review";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["CANCELLED"] = "cancelled";
    TaskStatus["ON_HOLD"] = "on_hold";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["HIGH"] = "high";
    TaskPriority["URGENT"] = "urgent";
    TaskPriority["CRITICAL"] = "critical";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var TaskCategory;
(function (TaskCategory) {
    TaskCategory["DEVELOPMENT"] = "development";
    TaskCategory["DESIGN"] = "design";
    TaskCategory["MARKETING"] = "marketing";
    TaskCategory["ADMIN"] = "admin";
    TaskCategory["FINANCE"] = "finance";
    TaskCategory["OPERATIONS"] = "operations";
    TaskCategory["FUNDRAISING"] = "fundraising";
    TaskCategory["VOLUNTEER_MANAGEMENT"] = "volunteer_management";
    TaskCategory["CONTENT_CREATION"] = "content_creation";
    TaskCategory["EVENT_PLANNING"] = "event_planning";
    TaskCategory["COMMUNICATION"] = "communication";
    TaskCategory["RESEARCH"] = "research";
    TaskCategory["OTHER"] = "other";
})(TaskCategory || (exports.TaskCategory = TaskCategory = {}));
let Task = class Task {
};
exports.Task = Task;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 200 }),
    __metadata("design:type", String)
], Task.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 2000 }),
    __metadata("design:type", String)
], Task.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: TaskStatus,
        default: TaskStatus.TODO,
        index: true
    }),
    __metadata("design:type", String)
], Task.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: TaskPriority,
        default: TaskPriority.MEDIUM,
        index: true
    }),
    __metadata("design:type", String)
], Task.prototype, "priority", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: TaskCategory,
        required: true,
        index: true
    }),
    __metadata("design:type", String)
], Task.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Task.prototype, "assignedTo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Task.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.Types.ObjectId], ref: 'EnhancedUser', default: [] }),
    __metadata("design:type", Array)
], Task.prototype, "watchers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Task.prototype, "reviewedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EnhancedProject', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Task.prototype, "project", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, index: true }),
    __metadata("design:type", Date)
], Task.prototype, "dueDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Task.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Task.prototype, "completedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Task.prototype, "reviewedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0 }),
    __metadata("design:type", Number)
], Task.prototype, "estimatedHours", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0 }),
    __metadata("design:type", Number)
], Task.prototype, "actualHours", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0, max: 100 }),
    __metadata("design:type", Number)
], Task.prototype, "progressPercentage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.Types.ObjectId], ref: 'Task', default: [] }),
    __metadata("design:type", Array)
], Task.prototype, "dependencies", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.Types.ObjectId], ref: 'Task', default: [] }),
    __metadata("design:type", Array)
], Task.prototype, "blocks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Task.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Task.prototype, "labels", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Task.prototype, "requiredSkills", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Task.prototype, "isLocationBased", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 200 }),
    __metadata("design:type", String)
], Task.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: -90, max: 90 }),
    __metadata("design:type", Number)
], Task.prototype, "latitude", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: -180, max: 180 }),
    __metadata("design:type", Number)
], Task.prototype, "longitude", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Task.prototype, "isVolunteerTask", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 1, min: 1 }),
    __metadata("design:type", Number)
], Task.prototype, "volunteerSlotsNeeded", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.Types.ObjectId], ref: 'EnhancedUser', default: [] }),
    __metadata("design:type", Array)
], Task.prototype, "volunteerAssignees", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Task.prototype, "attachments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Task.prototype, "resources", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Task.prototype, "links", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                title: String,
                completed: { type: Boolean, default: false },
                completedBy: { type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser' },
                completedAt: Date,
                createdAt: { type: Date, default: Date.now }
            }],
        default: []
    }),
    __metadata("design:type", Array)
], Task.prototype, "checklist", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                content: String,
                author: { type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser', required: true },
                createdAt: { type: Date, default: Date.now },
                updatedAt: Date,
                isEdited: { type: Boolean, default: false },
                attachments: [String]
            }],
        default: []
    }),
    __metadata("design:type", Array)
], Task.prototype, "comments", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                user: { type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser', required: true },
                hours: { type: Number, required: true, min: 0 },
                description: String,
                date: { type: Date, required: true },
                createdAt: { type: Date, default: Date.now }
            }],
        default: []
    }),
    __metadata("design:type", Array)
], Task.prototype, "timeEntries", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Task.prototype, "requiresApproval", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Task.prototype, "approvedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Task.prototype, "approvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true, maxlength: 500 }),
    __metadata("design:type", String)
], Task.prototype, "approvalNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Task.prototype, "isRecurring", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] }),
    __metadata("design:type", String)
], Task.prototype, "recurringFrequency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Task.prototype, "nextOccurrence", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Task.prototype, "recurringEndDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], Task.prototype, "sendNotifications", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Task.prototype, "notificationRecipients", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], Task.prototype, "isVisible", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Task.prototype, "visibleToRoles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.Types.ObjectId], ref: 'EnhancedUser', default: [] }),
    __metadata("design:type", Array)
], Task.prototype, "visibleToUsers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, select: false }),
    __metadata("design:type", Boolean)
], Task.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, select: false }),
    __metadata("design:type", Date)
], Task.prototype, "deletedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser', select: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Task.prototype, "deletedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                action: String,
                description: String,
                userId: { type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser', required: true },
                timestamp: { type: Date, default: Date.now },
                details: Object
            }],
        default: []
    }),
    __metadata("design:type", Array)
], Task.prototype, "activityLog", void 0);
exports.Task = Task = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: "tasks",
        toJSON: {
            transform: function (doc, ret) {
                if (ret.__v)
                    delete ret.__v;
                return ret;
            }
        }
    })
], Task);
exports.TaskSchema = mongoose_1.SchemaFactory.createForClass(Task);
exports.TaskSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });
exports.TaskSchema.index({ createdBy: 1, createdAt: -1 });
exports.TaskSchema.index({ status: 1, priority: 1, dueDate: 1 });
exports.TaskSchema.index({ category: 1, status: 1 });
exports.TaskSchema.index({ project: 1, status: 1 });
exports.TaskSchema.index({ dueDate: 1 });
exports.TaskSchema.index({ startDate: 1 });
exports.TaskSchema.index({ completedAt: -1 });
exports.TaskSchema.index({ createdAt: -1 });
exports.TaskSchema.index({ updatedAt: -1 });
exports.TaskSchema.index({ status: 1, priority: 1, dueDate: 1 });
exports.TaskSchema.index({ assignedTo: 1, status: 1, createdAt: -1 });
exports.TaskSchema.index({ project: 1, status: 1, priority: 1 });
exports.TaskSchema.index({ isVolunteerTask: 1, status: 1, dueDate: 1 });
exports.TaskSchema.index({ latitude: 1, longitude: 1 }, { sparse: true });
exports.TaskSchema.index({
    title: 'text',
    description: 'text',
    tags: 'text',
    labels: 'text',
    requiredSkills: 'text'
});
exports.TaskSchema.virtual('daysUntilDue').get(function () {
    if (!this.dueDate)
        return null;
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});
exports.TaskSchema.virtual('isOverdue').get(function () {
    if (!this.dueDate)
        return false;
    return new Date() > new Date(this.dueDate) && this.status !== TaskStatus.COMPLETED;
});
exports.TaskSchema.virtual('checklistProgress').get(function () {
    if (this.checklist.length === 0)
        return 0;
    const completed = this.checklist.filter(item => item.completed).length;
    return (completed / this.checklist.length) * 100;
});
exports.TaskSchema.virtual('totalTimeLogged').get(function () {
    return this.timeEntries.reduce((total, entry) => total + entry.hours, 0);
});
exports.TaskSchema.virtual('volunteerSlotsFilled').get(function () {
    return this.volunteerAssignees.length;
});
exports.TaskSchema.virtual('volunteerSlotsAvailable').get(function () {
    return this.volunteerSlotsNeeded - this.volunteerAssignees.length;
});
exports.TaskSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === TaskStatus.COMPLETED && !this.completedAt) {
        this.completedAt = new Date();
    }
    if (this.isModified('status') && this.status === TaskStatus.IN_REVIEW && !this.reviewedAt) {
        this.reviewedAt = new Date();
    }
    if (this.isModified('checklist')) {
        const checklist = this.checklist || [];
        const completed = checklist.filter(item => item.completed).length;
        this.progressPercentage = checklist.length > 0 ? (completed / checklist.length) * 100 : 0;
    }
    if (this.isModified('recurringFrequency') && this.isRecurring) {
        const now = new Date();
        switch (this.recurringFrequency) {
            case 'daily':
                this.nextOccurrence = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                break;
            case 'weekly':
                this.nextOccurrence = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
                this.nextOccurrence = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
                break;
            case 'yearly':
                this.nextOccurrence = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
                break;
        }
    }
    next();
});
exports.TaskSchema.pre(/^find/, function (next) {
    if (!this.getQuery().includeDeleted) {
        this.find({ isDeleted: { $ne: true } });
    }
    next();
});
//# sourceMappingURL=task.schema.js.map