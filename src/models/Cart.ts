import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        items: {
            type: [
                {
                    product: {
                        type: mongoose.Schema.Types.ObjectId,
                        required: true,
                    },
                    variant: {
                        type: mongoose.Schema.Types.ObjectId,
                        required: true,
                    },
                    quantity: {
                        type: Number,
                        required: true,
                        min: 1,
                    },
                },
            ],
            default: [],
        },
    },
    {
        versionKey: false,
        timestamps: false,
    },
);

export default mongoose.model('Cart', cartSchema);
