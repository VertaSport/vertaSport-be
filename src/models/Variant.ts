import mongoose from 'mongoose';

const VariantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        items: [
            {
                image: { type: String, required: true },
                size: { type: mongoose.Schema.Types.ObjectId, ref: 'Size' },
                stock: { type: Number, required: true },
                sold: { type: Number, default: 0 },
            },
        ],
        color: { type: mongoose.Schema.Types.ObjectId, ref: 'Color', required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

const Variant = mongoose.model('Variant', VariantSchema);

export default Variant;
