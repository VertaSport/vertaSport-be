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
export const getCateDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const cateId = req.params.cateId;
    const cate = await Category.findById(cateId).populate('items');
    if (!cate) {
        throw new BadRequestError('Category not found');
    }

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: cate,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

export const createCate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    /*
  body: {
    name: 'string',
    items: ['string']
  }
  */
    const idSubCate = [];
    const findCate = await Category.findOne({ name: req.body.name });
    if (findCate) {
        throw new BadRequestError(`Danh mục ${req.body.name} đã tồn tại`);
    }
    if (req.body.items) {
        await Promise.all(
            req.body.items.map(async (item) => {
                const findSubCate = await SubCategory.findOne({ name: item });
                if (findSubCate) {
                    throw new BadRequestError(`Danh mục con ${item} đã tồn tại`);
                }
                const subCateNew = await SubCategory.create({ name: item });
                idSubCate.push(subCateNew._id);
            }),
        );
    }
    const cateNew = new Category({ ...req.body, items: idSubCate });
    await cateNew.save();

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});
export const updateCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    /*
  body: {
    name: 'string',
    items: {
      _id: 'string',
      name: 'string'
    }
  }
  */
    const idSubCate = [];
    const parentCateId = req.params.cateId;
    const currentCate = await Category.findById(parentCateId);
    if (!currentCate) {
        throw new BadRequestError('Category not found');
    }
    const findCate = await Category.findOne({ name: req.body.name });

    if (findCate) {
        throw new BadRequestError('Category already exists');
    }
    if (req.body.items) {
        await Promise.all(
            req.body.items.map(async (item) => {
                const findSubCateByName = await SubCategory.findOne({ name: item.name });

                if (item._id) {
                    const findSubCateById = await SubCategory.findById(item._id);
                    if (!findSubCateById) {
                        throw new BadRequestError(`Danh mục con ${item._id} không tồn tại`);
                    }
                    if (findSubCateById.name !== item.name) {
                        if (findSubCateByName) {
                            throw new BadRequestError(`Danh mục con ${item.name} đã tồn tại`);
                        }
                    }
                    await SubCategory.findByIdAndUpdate(item._id, { name: item.name }, { new: true });
                    idSubCate.push(item._id);
                } else {
                    if (findSubCateByName) {
                        throw new BadRequestError(`Danh mục con ${item.name} đã tồn tại`);
                    }
                    const subCateNew = await SubCategory.create({ name: item.name });
                    idSubCate.push(subCateNew._id);
                }
            }),
        );
    }
    currentCate.name = req.body.name;
    currentCate.items = idSubCate;
    await currentCate.save();

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});
