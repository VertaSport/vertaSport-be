import { BadRequestError } from '@/error/customError';
import APIQuery from '@/helpers/apiQuery';
import asyncHandler from '@/helpers/asyncHandler';
import customResponse from '@/helpers/response';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const getAllCate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const feature = new APIQuery(Category.find().populate('items'), req.query);
    feature.filter().sort().limitFields();
    const cates = await feature.query.lean();

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: cates,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

export const createCate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const idSubCate = [];
    if (req.body.items && req.body.items.length > 0) {
        const subCateNew = await SubCategory.insertMany(req.body.items);
        idSubCate.push(...subCateNew.map((item) => item._id));
    }
    const cateNew = new Category({ ...req.body, items: idSubCate });
    await cateNew.save();

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: Category,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});
export const updateCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parentCateId = req.params.cateId;
    const currentCate = await Category.findById(parentCateId);
    if (!currentCate) {
        throw new BadRequestError('Category not found');
    }
    if (req.body.subCateId) {
        SubCategory.findByIdAndUpdate(req.body.subCate._id, { name: req.body.subCate.name }, { new: true });
    }
    const cateNew = new Category({ name: req.body.name });
    await cateNew.save();

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: Category,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});
