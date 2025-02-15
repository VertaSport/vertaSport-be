import mongoose from 'mongoose';

const VariantSchema = new mongoose.Schema(
    {
        items: [
            {
                image: { type: String, required: true },
                imageRef: { type: String, required: true },
                size: { type: mongoose.Schema.Types.ObjectId },
                stock: { type: Number, required: true },
                sold: { type: Number, default: 0 },
            },
        ],
        color: { type: mongoose.Schema.Types.ObjectId, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

const Variant = mongoose.model('Variant', VariantSchema);

export default Variant;
