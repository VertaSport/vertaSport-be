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
    try {
        const normalizedValue =
            req.body.type === 'numericsize' ? req.body.value.trim() : req.body.value.trim().toUpperCase();

        req.body.value = normalizedValue;

        const existingSize = await Size.findOne({
            value: { $regex: new RegExp(`^${normalizedValue}$`, 'i') },
        });

        if (existingSize) {
            return res.status(StatusCodes.BAD_REQUEST).json(
                customResponse<null>({
                    data: null,
                    success: false,
                    status: StatusCodes.BAD_REQUEST,
                    message: 'Kích cỡ này đã tồn tại!',
                }),
            );
        }

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
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
            customResponse<null>({
                data: null,
                success: false,
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: 'Đã xảy ra lỗi khi tạo kích cỡ mới!',
            }),
        );
    }
});

export const updateSize = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existingSize = await Size.findById(req.params.id);
        if (!existingSize) {
            return res.status(StatusCodes.NOT_FOUND).json(
                customResponse<null>({
                    data: null,
                    success: false,
                    status: StatusCodes.NOT_FOUND,
                    message: 'Không tìm thấy kích cỡ này!',
                }),
            );
        }

        const normalizedValue =
            req.body.type === 'numericsize' ? req.body.value.trim() : req.body.value.trim().toUpperCase();

        req.body.value = normalizedValue;

        const duplicateSize = await Size.findOne({
            _id: { $ne: req.params.id },
            value: { $regex: new RegExp(`^${normalizedValue}$`, 'i') },
        });

        if (duplicateSize) {
            return res.status(StatusCodes.BAD_REQUEST).json(
                customResponse<null>({
                    data: null,
                    success: false,
                    status: StatusCodes.BAD_REQUEST,
                    message: 'Kích cỡ này đã tồn tại!',
                }),
            );
        }

        const updatedSize = await Size.findByIdAndUpdate(req.params.id, req.body, { new: true });

        return res.status(StatusCodes.OK).json(
            customResponse({
                data: updatedSize,
                success: true,
                status: StatusCodes.OK,
                message: ReasonPhrases.OK,
            }),
        );
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
            customResponse<null>({
                data: null,
                success: false,
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: 'Đã xảy ra lỗi khi cập nhật kích cỡ!',
            }),
        );
    }
});
