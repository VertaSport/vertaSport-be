import mongoose, { Document, Schema } from 'mongoose';

export interface IColorSchema extends Document {
    name: string;
    hex: string;
}

const ColorSchema = new Schema<IColorSchema>(
    {
        name: { type: String, required: true, trim: true },
        hex: { type: String, required: true, trim: true },
    },
    {
        timestamps: false,
        versionKey: false,
    },
);

const Color = mongoose.model<IColorSchema>('Color', ColorSchema);
export default Color;
