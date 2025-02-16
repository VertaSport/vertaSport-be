import mongoose, { Document, Schema } from 'mongoose';

export interface ICategorySchema extends Document {
    name: string;
    items: mongoose.Types.ObjectId[];
}

const CategorySchema = new Schema<ICategorySchema>(
    {
        name: { type: String, required: true, trim: true },
        items: [{ type: mongoose.Schema.Types.ObjectId, default: [] , ref: 'SubCategory' }],
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

const Category = mongoose.model<ICategorySchema>('Category', CategorySchema);
export default Category;
