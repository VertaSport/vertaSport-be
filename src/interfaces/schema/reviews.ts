import mongoose from 'mongoose';

interface IVariant {
    size: string;
    color: string;
    name: string;
    variantId: mongoose.Schema.Types.ObjectId;
}
export interface IReviewsSchema extends mongoose.Document {
    userId: mongoose.Schema.Types.ObjectId;
    rating: number;
    content: string;
    productId: mongoose.Schema.Types.ObjectId;
    variants: IVariant[];
    isHided:boolean;
}
