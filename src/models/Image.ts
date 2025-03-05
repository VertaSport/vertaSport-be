import mongoose, { Schema } from 'mongoose';

const ImageSchema = new Schema(
    {
        url: { type: String, required: true, trim: true },
        ref: { type: String, required: true, trim: true },
    },
    {
        timestamps: false,
        versionKey: false,
    },
);

const Image = mongoose.model('Image', ImageSchema);
export default Image;
