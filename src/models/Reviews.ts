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
        variant: {
            size: String,
            color: String,
            name: String,
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
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

export default mongoose.model<IReviewsSchema>('Review', reviewsSchema);
