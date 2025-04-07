import { BadRequestError } from '@/error/customError';
import APIQuery, { QueryString } from '@/helpers/apiQuery';
import { IColorRaw } from '@/models/Color';
import Product from '@/models/Product';
import Variant from '@/models/Variant';
import { ICreateProduct, ICreateVariant } from '@/types/product';
import { removeUploadedFile } from '@/utils/files';
import mongoose, { Types } from 'mongoose';

export const createProduct = async (dto: ICreateProduct, imageRefVariants: string[]) => {
    // const session = await mongoose.startSession();
    // session.startTransaction();
    try {
        const product = new Product(dto);
        await product.save();
        // await session.commitTransaction();
        return product;
    } catch (error) {
        await Promise.all([
            removeUploadedFile(dto.thumbnailRef),
            ...imageRefVariants.map((imageRef) => removeUploadedFile(imageRef)),
            Variant.deleteMany({ _id: { $in: dto.variants } }),
        ]);
        // await session.abortTransaction();
        throw new BadRequestError(error.message);
    } finally {
        // session.endSession();
    }
};
export const updateProduct = async (id: string, dto: any, variants: any, imageRefVariants: string[]) => {
    // const session = await mongoose.startSession();
    try {
        // await session.withTransaction(async () => {
        const variantIds: Types.ObjectId[] = [];
        const filterColor: string[] = [];
        const filterSize: string[] = [];

        for (const variant of variants) {
            const variantId = variant._id ? new Types.ObjectId(variant._id) : new Types.ObjectId();

            variantIds.push(variantId);

            if (variant._id) {
                await Variant.findByIdAndUpdate(variant._id, variant);
            } else {
                await Variant.create([{ ...variant, _id: variantId }]);
            }

            filterColor.push(variant.color);
            filterSize.push(variant.size);
        }

        dto.variants = variantIds;
        dto.filterColor = [...new Set(filterColor)];
        dto.filterSize = [...new Set(filterSize)];

        await Product.findByIdAndUpdate(id, dto, { new: true });
        // });
    } catch (error) {
        await Promise.all(imageRefVariants.map((imageRef) => removeUploadedFile(imageRef)));
        throw new BadRequestError(error.message);
    } finally {
        // session.endSession();
    }
};

export const deleteProduct = async (id: string) => {
    await Product.findByIdAndUpdate(id, { isDeleted: true });
    return null;
};

export const getAllProducts = async (queryString: QueryString) => {
    const features = new APIQuery(
        Product.find()
            .populate({
                path: 'variants',
                select: '-createdAt -updatedAt -imageRef',
                populate: [
                    {
                        path: 'color',
                        select: '-createdAt -updatedAt',
                    },
                    {
                        path: 'size',
                        select: '-createdAt -updatedAt -type',
                    },
                ],
            })
            .lean(),
        queryString,
    );
    features.filter().sort().limitFields().search().paginate();
    const [data, totalDocs] = await Promise.all([features.query, features.count()]);
    const newData = data.map((product: any) => {
        const groupedByColor = (
            product.variants as {
                image: string;
                imageRef: string;
                size: { _id: Types.ObjectId; value: string };
                stock: number;
                color: IColorRaw & { _id: Types.ObjectId };
            }[]
        ).reduce(
            (acc, item) => {
                const colorId = item.color._id.toString();
                if (!acc[colorId]) {
                    acc[colorId] = [];
                }
                acc[colorId].push(item);
                return acc;
            },
            {} as Record<
                string,
                {
                    image: string;
                    imageRef: string;
                    size: { _id: Types.ObjectId; value: string };
                    stock: number;
                    color: IColorRaw & { _id: Types.ObjectId };
                }[]
            >,
        );

        const variantsDetails = Object.entries(groupedByColor).map(([_, items]) => ({
            color: {
                ...items[0].color,
                image: items[0].image,
            },
            items: items.map((item) => {
                delete item.color;
                delete item.image;
                return item;
            }),
        }));

        const result = { ...product, variants: variantsDetails };
        return result;
    });
    return {
        data: newData,
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

export const getProductDetails = async (id: string) => {
    const product = await Product.findOne({ _id: id, isDeleted: false, isHide: false })
        .populate({
            path: 'variants',
            select: '-createdAt -updatedAt -imageRef',
            populate: [
                {
                    path: 'color',
                    select: '-createdAt -updatedAt',
                },
                {
                    path: 'size',
                    select: '-createdAt -updatedAt -type',
                },
            ],
        })
        .select('-type -isDeleted -isHide')
        .lean();
    const groupedByColor = (
        product.variants as unknown as {
            image: string;
            imageRef: string;
            size: { _id: Types.ObjectId; value: string };
            stock: number;
            color: IColorRaw & { _id: Types.ObjectId };
        }[]
    ).reduce(
        (acc, item) => {
            const colorId = item.color._id.toString();
            if (!acc[colorId]) {
                acc[colorId] = [];
            }
            acc[colorId].push(item);
            return acc;
        },
        {} as Record<
            string,
            {
                image: string;
                imageRef: string;
                size: { _id: Types.ObjectId; value: string };
                stock: number;
                color: IColorRaw & { _id: Types.ObjectId };
            }[]
        >,
    );

    const variantsDetails = Object.entries(groupedByColor).map(([_, items]) => ({
        color: {
            ...items[0].color,
            image: items[0].image,
        },
        items: items.map((item) => {
            delete item.color;
            delete item.image;
            return item;
        }),
    }));

    const result = { ...product, variants: variantsDetails };

    return result;
};
