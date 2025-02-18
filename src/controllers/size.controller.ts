import APIQuery from '@/helpers/apiQuery';
import asyncHandler from '@/helpers/asyncHandler';
import customResponse from '@/helpers/response';
import Size from '@/models/Size';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const getAllSize = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const feature = new APIQuery(Size.find(), req.query);
    feature.filter().sort().limitFields();
    const sizes = await feature.query.lean();

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: sizes,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

export const getDetailedSize = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const size = await Size.findById(req.params.id).lean();

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: size,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

export const createSize = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const size = new Size(req.body);
    await size.save();

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: size,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

export const updateSize = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const size = await Size.findByIdAndUpdate(req.params.id, req.body, { new: true });

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: size,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});
