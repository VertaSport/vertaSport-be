import mongoose from 'mongoose';

const ColorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        hex: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: false,
        versionKey: false,
    },
);

const Color = mongoose.model('Color', ColorSchema);

export default Color;
