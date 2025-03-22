import mongoose, { Schema, Document } from 'mongoose';

interface IVoucher extends Document {
    name: string;
    code: string;
    maxUsage: number;
    voucherDiscount: number;
    status: boolean;
    isOnlyForNewUser: boolean;
    minimumOrderPrice: number;
    startDate: Date;
    endDate: Date;
    usagePerUser: number;
    discountType: string;
    maxDiscountAmount: number;
}
export enum DiscountType {
    Percentage = 'percentage',
    Fixed = 'fixed',
}

const voucherSchema = new Schema<IVoucher>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
        },
        maxUsage: {
            type: Number,
            required: true,
        },
        discountType: {
            type: String,
            enum: Object.values(DiscountType),
            required: true,
            default: 'percentage',
        },
        voucherDiscount: {
            type: Number,
            required: true,
        },
        maxDiscountAmount: {
            type: Number,
            default: 0,
            description: 'Maximum discount amount applicable',
        },
        status: {
            type: Boolean,
            default: true,
        },
        isOnlyForNewUser: {
            type: Boolean,
            default: false,
        },
        minimumOrderPrice: {
            required: true,
            type: Number,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            required: true,
            type: Date,
        },
        usagePerUser: {
            type: Number,
            required: true,
            default: 1,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

voucherSchema.index({ code: 1 });

export default mongoose.model<IVoucher>('Voucher', voucherSchema);
