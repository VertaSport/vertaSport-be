import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IVariantSchema extends Document {
    image: string;
    imageRef: string;
    size?: Types.ObjectId;
    stock: number;
    color: Types.ObjectId;
}

const VariantSchema = new Schema<IVariantSchema>(
    {
        image: { type: String, required: true },
        imageRef: { type: String, required: true },
        size: { type: Schema.Types.ObjectId, ref: 'Size' },
        stock: { type: Number, required: true },
        color: { type: Schema.Types.ObjectId, ref: 'Color', required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

const Variant = mongoose.model<IVariantSchema>('Variant', VariantSchema);
export default Variant;
