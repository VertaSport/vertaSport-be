import { BadRequestError } from '@/error/customError';
import APIQuery, { QueryString } from '@/helpers/apiQuery';
import Product from '@/models/Product';
import Variant from '@/models/Variant';
import { ICreateProduct, ICreateVariant } from '@/types/product';
import mongoose from 'mongoose';

export const createProduct = async (dto: ICreateProduct) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const product = new Product(dto);
        await product.save({ session });
        await session.commitTransaction();
        return product;
    } catch (error) {
        await Variant.deleteMany({ _id: { $in: dto.variants } });
        await session.abortTransaction();
        throw new BadRequestError(error.message);
    } finally {
        session.endSession();
    }
};
export const updateProduct = async (id: string, dto: any) => {
    const product = await Product.findByIdAndUpdate(id, dto);
    return product;
};
export const deleteProduct = async (id: string) => {
    await Product.findByIdAndUpdate(id, { isDeleted: true });
    return null;
};

export const getAllProducts = async (queryString: QueryString) => {
    const features = new APIQuery(Product.find(), queryString);
    features.filter().sort().limitFields().search().paginate();
    const [data, totalDocs] = await Promise.all([features.query, features.count()]);
    return {
        data,
        totalDocs,
    };
};

export const createMultipleVariants = async (dtos: ICreateVariant[]) => {
    const variants = await Variant.insertMany(dtos);
    return variants;
};

export const updateVariant = async (id: string, dto: any) => {
    const variant = await Variant.findByIdAndUpdate(id, dto);
    return variant;
};
