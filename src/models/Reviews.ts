import { IReviewsSchema } from '@/interfaces/schema/reviews';
import mongoose from 'mongoose';

const reviewsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product',
        },
        variants: {
            type: [
                {
                    variantId: {
                        type: mongoose.Schema.Types.ObjectId,
                        required: true,
                        ref: 'Variant',
                    },
                    size: { type: String, default: '' },
                    color: { type: String, default: '' },
                    name: { type: String, default: '' },
                },
            ],
            default: [],
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        content: {
            type: String,
        },
        isHided: {
            type: Boolean,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

export default mongoose.model<IReviewsSchema>('Review', reviewsSchema);
