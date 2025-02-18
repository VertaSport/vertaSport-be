import asyncHandler from '@/helpers/asyncHandler';
import customResponse from '@/helpers/response';
import Color from '@/models/Color';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

// get all cart by user
export const getAllColor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const colors = await Color.find().lean();

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: colors,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

export const getDetailedColor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const color = await Color.findById(req.params.id).lean();

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: color,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

// create new color
export const createColor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const color = new Color(req.body);
    await color.save();

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: color,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

// update color
export const updateColor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const color = await Color.findByIdAndUpdate(req.params.id, req.body, { new: true });

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: color,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});
