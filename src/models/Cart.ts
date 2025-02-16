import mongoose, { Model, Schema } from 'mongoose';

export interface ICartItem {
    product: mongoose.Types.ObjectId;
    variant: mongoose.Types.ObjectId;
    quantity: number;
}

export interface ICartSchema extends Document {
    userId: mongoose.Types.ObjectId;
    items: ICartItem[];
}

const cartSchema = new Schema<ICartSchema>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        items: {
            type: [
                {
                    product: { type: mongoose.Schema.Types.ObjectId, required: true },
                    variant: { type: mongoose.Schema.Types.ObjectId, required: true },
                    quantity: { type: Number, required: true, min: 1 },
                },
            ],
            default: [],
        },
    },
    { versionKey: false, timestamps: false },
);

const Cart: Model<ICartSchema> = mongoose.model<ICartSchema>('Cart', cartSchema);
export default Cart;
