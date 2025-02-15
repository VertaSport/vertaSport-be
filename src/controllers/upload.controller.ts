import { BadRequestError } from '@/error/customError';
import asyncHandler from '@/helpers/asyncHandler';
import customResponse from '@/helpers/response';
import { uploadSingleFile } from '@/utils/files';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const uploadImage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file as any;
    if (!file) {
        throw new BadRequestError('Please upload a file');
    }
    const { downloadURL, urlRef } = await uploadSingleFile(file, 'files');
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: { downloadURL, urlRef },
            message: 'Upload file successfully',
            success: true,
            status: StatusCodes.OK,
        }),
    );
});

export const uploadImages = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files) {
        throw new BadRequestError('Please upload a file');
    }
    const iamges = [];
    for (const file of files['images']) {
        const image = await uploadSingleFile(file, 'files');
        iamges.push(image);
    }
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: iamges,
            message: 'Upload files successfully',
            success: true,
            status: StatusCodes.OK,
        }),
    );
});
