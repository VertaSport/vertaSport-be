import mongoose, { Document, Schema } from 'mongoose';
import { SizeEnum } from '@/constant/sizeType';

export interface ISizeSchema extends Document {
    type: SizeEnum;
    value: string;
}

const SizeSchema = new Schema<ISizeSchema>(
    {
        type: {
            type: String,
            required: true,
            enum: [SizeEnum.FreeSize, SizeEnum.NumericSize],
        },
        value: { type: String, required: true },
    },
    {
        timestamps: false,
        versionKey: false,
    },
);

const Size = mongoose.model<ISizeSchema>('Size', SizeSchema);
export default Size;
