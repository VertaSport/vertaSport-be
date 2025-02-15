import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' }],
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

const Category = mongoose.model('Category', CategorySchema);

export default Category;
