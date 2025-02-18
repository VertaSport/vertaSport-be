import { QueryString } from '@/helpers/apiQuery';
import asyncHandler from '@/helpers/asyncHandler';
import customResponse from '@/helpers/response';
import Category from '@/models/Category';
import { productService } from '@/services';
import { ICreateProduct } from '@/types/product';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

// Create a new product
export const createProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const dto: ICreateProduct = {
        name: req.body.name,
        price: req.body.price,
        summary: req.body.summary,
        thumbnail: req.body.thumbnail,
        thumbnailRef: req.body.thumbnailRef,
        isDeleted: req.body.isDeleted || false,
        isHide: req.body.isHide || false,
        type: req.body.type,
        variants: req.body.variants,
        categories: req.body.categories,
        filterSize: req.body.filterSize,
        filterColor: req.body.filterColor,
        imageRefVariants: req.body.imageRefVariants,
    };
    const data = await productService.createProduct(dto);
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: data,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

// Create a new variant
export const createVariant = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const datas = await productService.createMultipleVariants(req.body.variants);
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: datas,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

// Get all products client
export const getAllProductsClient = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const query: QueryString = { isDeleted: false, isHide: false, ...req.query };
    const page = req.query.page ? +req.query.page : 1;
    const limit = req.query.limit || 10;
    const filterSize = req.query.size ? (req.query.size as string).split(',') : null;
    const filterColor = req.query.color ? (req.query.color as string).split(',') : null;

    query.page = String(page);
    query.limit = String(limit);
    query.filterSize = filterSize;
    query.filterColor = filterColor;

    if (query.filterSize === null) delete query.filterSize;
    if (query.filterColor === null) delete query.filterColor;

    delete query.size;
    delete query.color;

    const products = await productService.getAllProducts(query, '-isHide filterSize filterColor');

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: products,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

// Get all products admin
export const getAllProductsAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const query: QueryString = { isDeleted: false, ...req.query };
    const page = req.query.page ? +req.query.page : 1;
    const limit = req.query.limit || 10;
    const filterSize = req.query.size ? (req.query.size as string).split(',') : null;
    const filterColor = req.query.color ? (req.query.color as string).split(',') : null;

    query.page = String(page);
    query.limit = String(limit);
    query.filterSize = filterSize;
    query.filterColor = filterColor;

    if (query.filterSize === null) delete query.filterSize;
    if (query.filterColor === null) delete query.filterColor;

    delete query.size;
    delete query.color;

    const [categories, subCategories, products] = await Promise.all([
        Category.find().select('name _id'),
        Category.find().select('name _id'),
        productService.getAllProducts(query),
    ]);

    products.data.forEach((product) => {
        const categoryObj = categories.find((el) => el._id.toString() === product.categories[0].toString());
        let subCategoryObj = null;
        if (product.categories[1]) {
            subCategoryObj = subCategories.find((el) => el._id.toString() === product.categories[1].toString());
        }
        product.categories = [categoryObj, subCategoryObj].filter((el) => el !== null);
    });

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: products,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

// Get 10 product best selling
export const Top10BestSelling = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const query: QueryString = { isDeleted: false, isHide: false, sort: '-sold' };
    const limit = 10;

    query.limit = String(limit);

    const products = await productService.getAllProducts(query, '-isHide filterSize filterColor');

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: products,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

// Get 10 newest product
export const get10Newest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const query: QueryString = { isDeleted: false, isHide: false, sort: '-createdAt' };
    const limit = 10;

    query.limit = String(limit);

    const products = await productService.getAllProducts(query, '-isHide filterSize filterColor');

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: products,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});
// Get product details
export const getProductDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const product = await productService.getProductDetails(id);
    const [category, subCategory] = await Promise.all([
        Category.findById(product.categories[0]).select('name _id'),
        Category.findById(product.categories[1]).select('name _id'),
    ]);
    const result = { ...product, categories: [category, subCategory].filter((el) => el !== null) };
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: result,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});
// Get product related
export const getProductRelated = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.categoryId;
    const product = await productService.getAllProducts(
        { categories: id, limit: '10' },
        '-isHide filterSize filterColor',
    );

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: product,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});
