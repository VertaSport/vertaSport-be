import mongoose from 'mongoose';

const SubCategorySchema = new mongoose.Schema(
    {
        name: {
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

const Category = mongoose.model('SubCategory', SubCategorySchema);

export default Category;
