import { SizeEnum } from '@/constant/sizeType';
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: String,
            required: true,
        },
        summary: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        thumbnailRef: {
            type: String,
            required: true,
        },
        isDeleted: { type: Boolean, default: false },
        isHide: { type: Boolean, default: false },
        type: {
            type: { hasColor: Boolean, sizeType: [SizeEnum.FreeSize, SizeEnum.NumericSize] },
        },
        variants: [{ type: mongoose.Schema.Types.ObjectId }],
        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
        ],
        filterSize: [{ type: mongoose.Schema.Types.ObjectId }],
        filterColor: [{ type: mongoose.Schema.Types.ObjectId }],
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

const Product = mongoose.model('Product', ProductSchema);

export default Product;
