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
        isDeleted: { type: Boolean, default: false },
        isHide: { type: Boolean, default: false },
        type: {
            type: { hasColor: Boolean, sizeType: SizeEnum },
        },
        variants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Variant' }],
        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Category',
                required: true,
            },
        ],
        values: [String],
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

const Product = mongoose.model('Product', ProductSchema);

export default Product;
