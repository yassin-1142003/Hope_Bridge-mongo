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
exports.DonationSchema = exports.Donation = exports.PaymentMethod = exports.DonationType = exports.DonationStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var DonationStatus;
(function (DonationStatus) {
    DonationStatus["PENDING"] = "pending";
    DonationStatus["COMPLETED"] = "completed";
    DonationStatus["FAILED"] = "failed";
    DonationStatus["REFUNDED"] = "refunded";
    DonationStatus["CANCELLED"] = "cancelled";
})(DonationStatus || (exports.DonationStatus = DonationStatus = {}));
var DonationType;
(function (DonationType) {
    DonationType["ONE_TIME"] = "one_time";
    DonationType["RECURRING"] = "recurring";
    DonationType["CROWDFUNDING"] = "crowdfunding";
    DonationType["SPONSORSHIP"] = "sponsorship";
})(DonationType || (exports.DonationType = DonationType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CREDIT_CARD"] = "credit_card";
    PaymentMethod["DEBIT_CARD"] = "debit_card";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
    PaymentMethod["PAYPAL"] = "paypal";
    PaymentMethod["STRIPE"] = "stripe";
    PaymentMethod["CRYPTOCURRENCY"] = "cryptocurrency";
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["CHECK"] = "check";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
let Donation = class Donation {
};
exports.Donation = Donation;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Donation.prototype, "donor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EnhancedProject', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Donation.prototype, "project", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: DonationStatus,
        default: DonationStatus.PENDING,
        index: true
    }),
    __metadata("design:type", String)
], Donation.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: DonationType,
        required: true,
        index: true
    }),
    __metadata("design:type", String)
], Donation.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: PaymentMethod,
        required: true
    }),
    __metadata("design:type", String)
], Donation.prototype, "paymentMethod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 0.01 }),
    __metadata("design:type", Number)
], Donation.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'AED', 'SAR'],
        required: true
    }),
    __metadata("design:type", String)
], Donation.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], Donation.prototype, "exchangeRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], Donation.prototype, "amountInUSD", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, unique: true, sparse: true }),
    __metadata("design:type", String)
], Donation.prototype, "transactionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, unique: true, sparse: true }),
    __metadata("design:type", String)
], Donation.prototype, "paymentIntentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Donation.prototype, "stripePaymentIntentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Donation.prototype, "paypalOrderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Donation.prototype, "bankReference", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] }),
    __metadata("design:type", String)
], Donation.prototype, "recurringFrequency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Donation.prototype, "nextDonationDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Donation.prototype, "recurringEndDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Donation.prototype, "isRecurringActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Donation.prototype, "isAnonymous", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], Donation.prototype, "anonymousName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Donation.prototype, "isDedicated", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], Donation.prototype, "dedicationRecipient", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true, maxlength: 500 }),
    __metadata("design:type", String)
], Donation.prototype, "dedicationMessage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Donation.prototype, "hasMatchingGift", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Donation.prototype, "matchingDonor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0 }),
    __metadata("design:type", Number)
], Donation.prototype, "matchingAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Donation.prototype, "processingFee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Donation.prototype, "platformFee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], Donation.prototype, "netAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Donation.prototype, "isTaxDeductible", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], Donation.prototype, "taxReceiptId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Donation.prototype, "taxReceiptIssuedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], Donation.prototype, "sendReceipt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], Donation.prototype, "sendThankYou", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Donation.prototype, "sendUpdates", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true, maxlength: 1000 }),
    __metadata("design:type", String)
], Donation.prototype, "donorNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true, maxlength: 1000 }),
    __metadata("design:type", String)
], Donation.prototype, "adminNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Donation.prototype, "refundedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0 }),
    __metadata("design:type", Number)
], Donation.prototype, "refundedAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true, maxlength: 500 }),
    __metadata("design:type", String)
], Donation.prototype, "refundReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Donation.prototype, "refundedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, select: false }),
    __metadata("design:type", Object)
], Donation.prototype, "paymentDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Donation.prototype, "processedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Donation.prototype, "processedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Donation.prototype, "ipAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Donation.prototype, "userAgent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, select: false }),
    __metadata("design:type", Boolean)
], Donation.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, select: false }),
    __metadata("design:type", Date)
], Donation.prototype, "deletedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EnhancedUser', select: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Donation.prototype, "deletedBy", void 0);
exports.Donation = Donation = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: "donations",
        toJSON: {
            transform: function (doc, ret) {
                if (ret.__v)
                    delete ret.__v;
                if (ret.paymentDetails)
                    delete ret.paymentDetails;
                return ret;
            }
        }
    })
], Donation);
exports.DonationSchema = mongoose_1.SchemaFactory.createForClass(Donation);
exports.DonationSchema.index({ donor: 1, createdAt: -1 });
exports.DonationSchema.index({ project: 1, createdAt: -1 });
exports.DonationSchema.index({ status: 1, createdAt: -1 });
exports.DonationSchema.index({ type: 1, createdAt: -1 });
exports.DonationSchema.index({ paymentMethod: 1, createdAt: -1 });
exports.DonationSchema.index({ amount: -1 });
exports.DonationSchema.index({ amountInUSD: -1 });
exports.DonationSchema.index({ transactionId: 1 }, { sparse: true });
exports.DonationSchema.index({ paymentIntentId: 1 }, { sparse: true });
exports.DonationSchema.index({ nextDonationDate: 1 }, { sparse: true });
exports.DonationSchema.index({ isRecurringActive: 1, nextDonationDate: 1 });
exports.DonationSchema.index({ createdAt: -1 });
exports.DonationSchema.index({ updatedAt: -1 });
exports.DonationSchema.index({ status: 1, type: 1, createdAt: -1 });
exports.DonationSchema.index({ donor: 1, status: 1, createdAt: -1 });
exports.DonationSchema.index({ project: 1, status: 1, createdAt: -1 });
exports.DonationSchema.index({ isAnonymous: 1, status: 1 });
exports.DonationSchema.index({ hasMatchingGift: 1, status: 1 });
exports.DonationSchema.index({
    donorNotes: 'text',
    adminNotes: 'text',
    dedicationMessage: 'text',
    anonymousName: 'text'
});
exports.DonationSchema.virtual('grossAmount').get(function () {
    return this.amount + this.processingFee + this.platformFee;
});
exports.DonationSchema.virtual('ageInDays').get(function () {
    return Math.floor((Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60 * 24));
});
exports.DonationSchema.virtual('isRecent').get(function () {
    return Math.floor((Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60 * 24)) <= 30;
});
exports.DonationSchema.pre('save', function (next) {
    if (this.isModified('amount') || this.isModified('processingFee') || this.isModified('platformFee')) {
        this.netAmount = this.amount - this.processingFee - this.platformFee;
    }
    if (this.isModified('recurringFrequency') && this.type === DonationType.RECURRING) {
        const now = new Date();
        switch (this.recurringFrequency) {
            case 'daily':
                this.nextDonationDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                break;
            case 'weekly':
                this.nextDonationDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
                this.nextDonationDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
                break;
            case 'yearly':
                this.nextDonationDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
                break;
        }
    }
    next();
});
exports.DonationSchema.pre(/^find/, function (next) {
    if (!this.getQuery().includeDeleted) {
        this.find({ isDeleted: { $ne: true } });
    }
    next();
});
//# sourceMappingURL=donation.schema.js.map