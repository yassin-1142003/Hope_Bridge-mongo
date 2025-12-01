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
exports.EnhancedUserSchema = exports.EnhancedUser = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const role_enum_1 = require("../../common/enums/role.enum");
let EnhancedUser = class EnhancedUser {
};
exports.EnhancedUser = EnhancedUser;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, minlength: 8 }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "passwordHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: role_enum_1.Role, default: role_enum_1.Role.USER, index: true }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], EnhancedUser.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], EnhancedUser.prototype, "emailVerified", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 20 }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 200 }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "avatar", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 50 }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, maxlength: 50 }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: -90, max: 90 }),
    __metadata("design:type", Number)
], EnhancedUser.prototype, "latitude", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: -180, max: 180 }),
    __metadata("design:type", Number)
], EnhancedUser.prototype, "longitude", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], EnhancedUser.prototype, "passwordChangedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, select: false }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "passwordResetToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, select: false }),
    __metadata("design:type", Date)
], EnhancedUser.prototype, "passwordResetExpires", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, select: false }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "emailVerificationToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, select: false }),
    __metadata("design:type", Date)
], EnhancedUser.prototype, "emailVerificationExpires", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, select: false }),
    __metadata("design:type", Boolean)
], EnhancedUser.prototype, "twoFactorEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, select: false }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "twoFactorSecret", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], select: false }),
    __metadata("design:type", Array)
], EnhancedUser.prototype, "backupCodes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, select: false }),
    __metadata("design:type", Number)
], EnhancedUser.prototype, "loginAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, select: false }),
    __metadata("design:type", Date)
], EnhancedUser.prototype, "lockUntil", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now, index: true }),
    __metadata("design:type", Date)
], EnhancedUser.prototype, "lastLoginAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "lastLoginIP", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "lastLoginUserAgent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], EnhancedUser.prototype, "loginCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['en', 'ar', 'fr', 'es'],
        default: 'en'
    }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "preferredLanguage", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light'
    }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "theme", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Boolean,
        default: true
    }),
    __metadata("design:type", Boolean)
], EnhancedUser.prototype, "emailNotifications", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Boolean,
        default: false
    }),
    __metadata("design:type", Boolean)
], EnhancedUser.prototype, "smsNotifications", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, select: false }),
    __metadata("design:type", Boolean)
], EnhancedUser.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, select: false }),
    __metadata("design:type", Date)
], EnhancedUser.prototype, "deletedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, select: false }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "deletedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], EnhancedUser.prototype, "updatedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                sessionId: String,
                device: String,
                browser: String,
                ip: String,
                location: String,
                lastActivity: Date,
                createdAt: { type: Date, default: Date.now }
            }],
        default: []
    }),
    __metadata("design:type", Array)
], EnhancedUser.prototype, "activeSessions", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                action: String,
                description: String,
                ip: String,
                userAgent: String,
                timestamp: { type: Date, default: Date.now }
            }],
        default: []
    }),
    __metadata("design:type", Array)
], EnhancedUser.prototype, "activityLog", void 0);
exports.EnhancedUser = EnhancedUser = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: "users",
        toJSON: {
            transform: function (doc, ret) {
                if (ret.passwordHash)
                    delete ret.passwordHash;
                if (ret.passwordResetToken)
                    delete ret.passwordResetToken;
                if (ret.passwordResetExpires)
                    delete ret.passwordResetExpires;
                if (ret.emailVerificationToken)
                    delete ret.emailVerificationToken;
                if (ret.emailVerificationExpires)
                    delete ret.emailVerificationExpires;
                if (ret.twoFactorSecret)
                    delete ret.twoFactorSecret;
                if (ret.loginAttempts)
                    delete ret.loginAttempts;
                if (ret.lockUntil)
                    delete ret.lockUntil;
                if (ret.__v)
                    delete ret.__v;
                return ret;
            }
        }
    })
], EnhancedUser);
exports.EnhancedUserSchema = mongoose_1.SchemaFactory.createForClass(EnhancedUser);
exports.EnhancedUserSchema.index({ email: 1 }, { unique: true });
exports.EnhancedUserSchema.index({ role: 1, isActive: 1 });
exports.EnhancedUserSchema.index({ lastLoginAt: -1 });
exports.EnhancedUserSchema.index({ createdAt: -1 });
exports.EnhancedUserSchema.index({ isActive: 1, emailVerified: 1 });
exports.EnhancedUserSchema.index({ 'activeSessions.lastActivity': -1 });
exports.EnhancedUserSchema.index({
    name: 'text',
    email: 'text',
    bio: 'text',
    department: 'text',
    position: 'text'
});
exports.EnhancedUserSchema.virtual('accountAge').get(function () {
    return Math.floor((Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60 * 24));
});
exports.EnhancedUserSchema.pre('save', function (next) {
    if (this.isModified('passwordHash')) {
        this.passwordChangedAt = new Date();
    }
    if (this.isNew) {
        this.activityLog.push({
            action: 'ACCOUNT_CREATED',
            description: 'User account was created',
            userId: this._id,
            ip: 'system',
            userAgent: 'system',
            timestamp: new Date()
        });
    }
    if (this.isModified() && !this.isNew) {
        this.activityLog.push({
            action: 'PROFILE_UPDATED',
            description: 'User profile was updated',
            ip: 'system',
            userAgent: 'system',
            timestamp: new Date()
        });
    }
    next();
});
exports.EnhancedUserSchema.pre(/^find/, function (next) {
    if (!this.getQuery().includeDeleted) {
        this.find({ isDeleted: { $ne: true } });
    }
    next();
});
//# sourceMappingURL=enhanced-user.schema.js.map