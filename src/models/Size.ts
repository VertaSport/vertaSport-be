import { SizeEnum } from '@/constant/sizeType';
import mongoose from 'mongoose';

const SizeSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: [SizeEnum.FreeSize, SizeEnum.NumericSize],
        },
        values: [String],
    },
    {
        timestamps: false,
        versionKey: false,
    },
);

const Size = mongoose.model('Size', SizeSchema);

export default Size;
