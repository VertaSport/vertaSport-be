import mongoose, { Schema, Document } from 'mongoose';

interface IVoucher extends Document {
    name: string;
    code: string;
    maxUsage: number;
    voucherDiscount: number;
    status: boolean;
    isOnlyForNewUser: boolean;
    minimumOrderPrice?: number;
    startDate?: Date;
    endDate?: Date;
    usagePerUser: number;
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
        voucherDiscount: {
            type: Number,
            required: true,
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
            type: Number,
        },
        startDate: {
            type: Date,
        },
        endDate: {
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