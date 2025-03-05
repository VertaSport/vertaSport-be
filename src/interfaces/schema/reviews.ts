import mongoose from 'mongoose';

export interface IReviewsSchema extends mongoose.Document {
    userId: mongoose.Schema.Types.ObjectId;
    rating: number;
    content: string;
    productId: mongoose.Schema.Types.ObjectId;
}
