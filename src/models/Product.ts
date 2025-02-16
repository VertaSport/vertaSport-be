import mongoose, { Document, model, ObjectId, Schema } from 'mongoose';
import { SizeEnum } from '@/constant/sizeType';

export interface IProductType {
    hasColor: boolean;
    sizeType: SizeEnum[];
}

export interface IProductSchema extends Document {
    name: string;
    price: string;
    summary: string;
    thumbnail: string;
    thumbnailRef: string;
    sold: number;
    isDeleted: boolean;
    isHide: boolean;
    type: IProductType;
    variants: ObjectId[];
    categories: ObjectId[];
    filterSize: ObjectId[];
    filterColor: ObjectId[];
}

const ProductSchema = new Schema<IProductSchema>(
    {
        name: { type: String, required: true },
        price: { type: String, required: true },
        summary: { type: String, required: true },
        thumbnail: { type: String, required: true },
        thumbnailRef: { type: String, required: true },
        sold: { type: Number, default: 0 },
        isDeleted: { type: Boolean, default: false },
        isHide: { type: Boolean, default: false },
        type: {
            hasColor: { type: Boolean },
            sizeType: { type: [String], enum: Object.values(SizeEnum) },
        },
        variants: [{ type: Schema.Types.ObjectId, ref: 'Variant' }],
        categories: [{ type: Schema.Types.ObjectId, required: true }],
        filterSize: [{ type: Schema.Types.ObjectId }],
        filterColor: [{ type: Schema.Types.ObjectId }],
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

const Product = model<IProductSchema>('Product', ProductSchema);
export default Product;
