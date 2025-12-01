import { HydratedDocument, Types } from "mongoose";
export type DonationDocument = HydratedDocument<Donation>;
export declare enum DonationStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded",
    CANCELLED = "cancelled"
}
export declare enum DonationType {
    ONE_TIME = "one_time",
    RECURRING = "recurring",
    CROWDFUNDING = "crowdfunding",
    SPONSORSHIP = "sponsorship"
}
export declare enum PaymentMethod {
    CREDIT_CARD = "credit_card",
    DEBIT_CARD = "debit_card",
    BANK_TRANSFER = "bank_transfer",
    PAYPAL = "paypal",
    STRIPE = "stripe",
    CRYPTOCURRENCY = "cryptocurrency",
    CASH = "cash",
    CHECK = "check"
}
export declare class Donation {
    donor: Types.ObjectId;
    project?: Types.ObjectId;
    status: DonationStatus;
    type: DonationType;
    paymentMethod: PaymentMethod;
    amount: number;
    currency: string;
    exchangeRate: number;
    amountInUSD: number;
    transactionId?: string;
    paymentIntentId?: string;
    stripePaymentIntentId?: string;
    paypalOrderId?: string;
    bankReference?: string;
    recurringFrequency?: string;
    nextDonationDate?: Date;
    recurringEndDate?: Date;
    isRecurringActive?: boolean;
    isAnonymous: boolean;
    anonymousName?: string;
    isDedicated: boolean;
    dedicationRecipient?: string;
    dedicationMessage?: string;
    hasMatchingGift: boolean;
    matchingDonor?: Types.ObjectId;
    matchingAmount?: number;
    processingFee: number;
    platformFee: number;
    netAmount: number;
    isTaxDeductible: boolean;
    taxReceiptId?: string;
    taxReceiptIssuedAt?: Date;
    sendReceipt: boolean;
    sendThankYou: boolean;
    sendUpdates: boolean;
    donorNotes?: string;
    adminNotes?: string;
    refundedAt?: Date;
    refundedAmount?: number;
    refundReason?: string;
    refundedBy?: Types.ObjectId;
    paymentDetails?: {
        cardLast4?: string;
        cardBrand?: string;
        cardExpMonth?: number;
        cardExpYear?: number;
        bankName?: string;
        accountLast4?: string;
        email?: string;
    };
    processedBy?: Types.ObjectId;
    processedAt?: Date;
    ipAddress?: string;
    userAgent?: string;
    isDeleted: boolean;
    deletedAt?: Date;
    deletedBy?: Types.ObjectId;
}
export declare const DonationSchema: import("mongoose").Schema<Donation, import("mongoose").Model<Donation, any, any, any, import("mongoose").Document<unknown, any, Donation, any, {}> & Donation & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Donation, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Donation>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Donation> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
