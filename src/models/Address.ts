import mongoose, { Schema } from 'mongoose';
const addressSchema = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            default: 'Viet Nam',
        },
        province: {
            type: String,
            required: true,
        },
        provinceId: {
            type: Number,
        },
        district: {
            type: String,
            required: true,
        },
        districtId: {
            type: Number,
        },
        ward: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        default: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: 'Khác',
            enum: ['Khác', 'Nhà', 'Công ty'],
        },
    },
    { versionKey: false, timestamps: true },
);

export default mongoose.model('Address', addressSchema);
