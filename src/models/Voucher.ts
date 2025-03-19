import mongoose, { Schema } from 'mongoose';
const voucherSchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        discount: { type: Number, required: true },
        forNewUser: { type: Boolean, required: true },
        expired: { type: Date, required: true },
        isInfinite: { type: Boolean, required: true },
        quantity: { type: Number, required: true },
        requiredPrice: { type: Number, required: true },
    },
    { versionKey: false, timestamps: true },
);

export default mongoose.model('Voucher', voucherSchema);
