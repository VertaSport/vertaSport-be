import { SizeEnum } from '@/constant/sizeType';
import { QueryString } from '@/helpers/apiQuery';
import asyncHandler from '@/helpers/asyncHandler';
import customResponse from '@/helpers/response';
import { productService } from '@/services';
import { ICreateProduct, ICreateVariant } from '@/types/product';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

export const createProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const dto: ICreateProduct = {
        name: 'Sample Product',
        price: 100,
        summary: 'Sample Description',
        thumbnail: 'https://sample.com/image.jpg',
        thumbnailRef: 'https://sample.com/image.jpg',
        isDeleted: false,
        isHide: false,
        type: { hasColor: false, sizeType: SizeEnum.FreeSize },
        variants: [new mongoose.Types.ObjectId().toString()],
        categories: [new mongoose.Types.ObjectId().toString()],
        filterSize: [new mongoose.Types.ObjectId().toString()],
        filterColor: [new mongoose.Types.ObjectId().toString()],
    };
    await productService.createProduct(dto);
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

export const createVariant = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const dto: ICreateVariant = {
        items: [
            {
                image: 'https://sample.com/image.jpg',
                imageRef: 'https://sample.com/image.jpg',
                size: new mongoose.Types.ObjectId().toString(),
                stock: 10,
                sold: 0,
            },
        ],
        color: new mongoose.Types.ObjectId().toString(),
    };
    await productService.createVariant(dto);
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

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

    const products = await productService.getAllProducts(query);

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: products,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});
