import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type DonationDocument = HydratedDocument<Donation>;

export enum DonationStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
  CANCELLED = "cancelled",
}

export enum DonationType {
  ONE_TIME = "one_time",
  RECURRING = "recurring",
  CROWDFUNDING = "crowdfunding",
  SPONSORSHIP = "sponsorship",
}

export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  BANK_TRANSFER = "bank_transfer",
  PAYPAL = "paypal",
  STRIPE = "stripe",
  CRYPTOCURRENCY = "cryptocurrency",
  CASH = "cash",
  CHECK = "check",
}

@Schema({
  timestamps: true,
  collection: "donations",
  toJSON: {
    transform: function(doc: any, ret: any) {
      // Remove optional fields that might not exist
      if (ret.__v) delete ret.__v;
      if (ret.paymentDetails) delete ret.paymentDetails;
      return ret;
    }
  }
})
export class Donation {
  @Prop({ required: true, type: Types.ObjectId, ref: 'EnhancedUser', index: true })
  donor!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EnhancedProject', index: true })
  project?: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: DonationStatus, 
    default: DonationStatus.PENDING,
    index: true 
  })
  status!: DonationStatus;

  @Prop({ 
    type: String, 
    enum: DonationType, 
    required: true,
    index: true 
  })
  type!: DonationType;

  @Prop({ 
    type: String, 
    enum: PaymentMethod, 
    required: true 
  })
  paymentMethod!: PaymentMethod;

  // Financial Information
  @Prop({ type: Number, required: true, min: 0.01 })
  amount!: number;

  @Prop({ 
    type: String, 
    enum: ['USD', 'EUR', 'GBP', 'AED', 'SAR'], 
    required: true 
  })
  currency!: string;

  @Prop({ type: Number, required: true })
  exchangeRate!: number;

  @Prop({ type: Number, required: true })
  amountInUSD!: number;

  // Payment Processing
  @Prop({ type: String, unique: true, sparse: true })
  transactionId?: string;

  @Prop({ type: String, unique: true, sparse: true })
  paymentIntentId?: string;

  @Prop({ type: String })
  stripePaymentIntentId?: string;

  @Prop({ type: String })
  paypalOrderId?: string;

  @Prop({ type: String })
  bankReference?: string;

  // Recurring Donation Settings
  @Prop({ type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] })
  recurringFrequency?: string;

  @Prop({ type: Date })
  nextDonationDate?: Date;

  @Prop({ type: Date })
  recurringEndDate?: Date;

  @Prop({ type: Boolean, default: false })
  isRecurringActive?: boolean;

  // Anonymous Donation
  @Prop({ type: Boolean, default: false })
  isAnonymous!: boolean;

  @Prop({ type: String, trim: true, maxlength: 100 })
  anonymousName?: string;

  // Dedication Information
  @Prop({ type: Boolean, default: false })
  isDedicated!: boolean;

  @Prop({ type: String, trim: true, maxlength: 100 })
  dedicationRecipient?: string;

  @Prop({ type: String, trim: true, maxlength: 500 })
  dedicationMessage?: string;

  // Matching Gift
  @Prop({ type: Boolean, default: false })
  hasMatchingGift!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'EnhancedUser' })
  matchingDonor?: Types.ObjectId;

  @Prop({ type: Number, min: 0 })
  matchingAmount?: number;

  // Fees and Processing
  @Prop({ type: Number, default: 0 })
  processingFee!: number;

  @Prop({ type: Number, default: 0 })
  platformFee!: number;

  @Prop({ type: Number, required: true })
  netAmount!: number;

  // Tax Information
  @Prop({ type: Boolean, default: false })
  isTaxDeductible!: boolean;

  @Prop({ type: String, trim: true })
  taxReceiptId?: string;

  @Prop({ type: Date })
  taxReceiptIssuedAt?: Date;

  // Communication Settings
  @Prop({ type: Boolean, default: true })
  sendReceipt!: boolean;

  @Prop({ type: Boolean, default: true })
  sendThankYou!: boolean;

  @Prop({ type: Boolean, default: false })
  sendUpdates!: boolean;

  // Notes and Comments
  @Prop({ type: String, trim: true, maxlength: 1000 })
  donorNotes?: string;

  @Prop({ type: String, trim: true, maxlength: 1000 })
  adminNotes?: string;

  // Refund Information
  @Prop({ type: Date })
  refundedAt?: Date;

  @Prop({ type: Number, min: 0 })
  refundedAmount?: number;

  @Prop({ type: String, trim: true, maxlength: 500 })
  refundReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'EnhancedUser' })
  refundedBy?: Types.ObjectId;

  // Payment Details (encrypted in production)
  @Prop({ type: Object, select: false })
  paymentDetails?: {
    cardLast4?: string;
    cardBrand?: string;
    cardExpMonth?: number;
    cardExpYear?: number;
    bankName?: string;
    accountLast4?: string;
    email?: string;
  };

  // Audit Trail
  @Prop({ type: Types.ObjectId, ref: 'EnhancedUser' })
  processedBy?: Types.ObjectId;

  @Prop({ type: Date })
  processedAt?: Date;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;

  // Soft Delete
  @Prop({ default: false, select: false })
  isDeleted!: boolean;

  @Prop({ type: Date, select: false })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'EnhancedUser', select: false })
  deletedBy?: Types.ObjectId;
}

export const DonationSchema = SchemaFactory.createForClass(Donation);

// Performance Indexes
DonationSchema.index({ donor: 1, createdAt: -1 });
DonationSchema.index({ project: 1, createdAt: -1 });
DonationSchema.index({ status: 1, createdAt: -1 });
DonationSchema.index({ type: 1, createdAt: -1 });
DonationSchema.index({ paymentMethod: 1, createdAt: -1 });
DonationSchema.index({ amount: -1 });
DonationSchema.index({ amountInUSD: -1 });
DonationSchema.index({ transactionId: 1 }, { sparse: true });
DonationSchema.index({ paymentIntentId: 1 }, { sparse: true });
DonationSchema.index({ nextDonationDate: 1 }, { sparse: true });
DonationSchema.index({ isRecurringActive: 1, nextDonationDate: 1 });
DonationSchema.index({ createdAt: -1 });
DonationSchema.index({ updatedAt: -1 });

// Compound indexes for common queries
DonationSchema.index({ status: 1, type: 1, createdAt: -1 });
DonationSchema.index({ donor: 1, status: 1, createdAt: -1 });
DonationSchema.index({ project: 1, status: 1, createdAt: -1 });
DonationSchema.index({ isAnonymous: 1, status: 1 });
DonationSchema.index({ hasMatchingGift: 1, status: 1 });

// Text index for search functionality
DonationSchema.index({ 
  donorNotes: 'text',
  adminNotes: 'text',
  dedicationMessage: 'text',
  anonymousName: 'text'
});

// Virtual for gross amount (including fees)
DonationSchema.virtual('grossAmount').get(function() {
  return this.amount + this.processingFee + this.platformFee;
});

// Virtual for age in days
DonationSchema.virtual('ageInDays').get(function(this: any) {
  return Math.floor((Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for is recent (within last 30 days)
DonationSchema.virtual('isRecent').get(function(this: any) {
  return Math.floor((Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60 * 24)) <= 30;
});

// Pre-save middleware
DonationSchema.pre('save', function(next) {
  // Calculate net amount if not set
  if (this.isModified('amount') || this.isModified('processingFee') || this.isModified('platformFee')) {
    this.netAmount = this.amount - this.processingFee - this.platformFee;
  }
  
  // Set next donation date for recurring donations
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

// Pre-find middleware to exclude deleted documents
DonationSchema.pre(/^find/, function(this: any, next: any) {
  if (!this.getQuery().includeDeleted) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});
