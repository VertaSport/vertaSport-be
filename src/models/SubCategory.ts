import mongoose, { Document, Schema } from 'mongoose';

export interface ISubCategorySchema extends Document {
    name: string;
}

const SubCategorySchema = new Schema<ISubCategorySchema>(
    {
        name: { type: String, required: true, trim: true },
    },
    {
        timestamps: false,
        versionKey: false,
    },
);

const SubCategory = mongoose.model<ISubCategorySchema>('SubCategory', SubCategorySchema);
export default SubCategory;
