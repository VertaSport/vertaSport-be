import { tokenTypes } from '@/constant/token';
import mongoose, { Schema } from 'mongoose';

const TokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: [tokenTypes.VERIFY_EMAIL],
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Token', TokenSchema);
