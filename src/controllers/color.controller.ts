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
    try {
        const existingColor = await Color.findOne({
            $or: [{ name: req.body.name }, { hex: req.body.hex }],
        });

        if (existingColor) {
            const isDuplicateName = existingColor.name === req.body.name;
            return res.status(StatusCodes.BAD_REQUEST).json(
                customResponse<null>({
                    data: null,
                    success: false,
                    status: StatusCodes.BAD_REQUEST,
                    message: isDuplicateName ? 'Tên màu này đã tồn tại!' : 'Mã màu này đã tồn tại!',
                }),
            );
        }

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
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
            customResponse<null>({
                data: null,
                success: false,
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: 'Đã xảy ra lỗi khi tạo màu mới!',
            }),
        );
    }
});

// update color
export const updateColor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existingColor = await Color.findById(req.params.id);
        if (!existingColor) {
            return res.status(StatusCodes.NOT_FOUND).json(
                customResponse<null>({
                    data: null,
                    success: false,
                    status: StatusCodes.NOT_FOUND,
                    message: 'Không tìm thấy màu sắc này!',
}),
            );
        }

        const duplicateColor = await Color.findOne({
            _id: { $ne: req.params.id },
            $or: [{ name: req.body.name }, { hex: req.body.hex }],
        });

        if (duplicateColor) {
            const isDuplicateName = duplicateColor.name === req.body.name;
            return res.status(StatusCodes.BAD_REQUEST).json(
                customResponse<null>({
                    data: null,
                    success: false,
                    status: StatusCodes.BAD_REQUEST,
                    message: isDuplicateName ? 'Tên màu này đã tồn tại!' : 'Mã màu này đã tồn tại!',
                }),
            );
        }

        const updatedColor = await Color.findByIdAndUpdate(req.params.id, req.body, { new: true });

        return res.status(StatusCodes.OK).json(
            customResponse({
                data: updatedColor,
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
                message: 'Đã xảy ra lỗi khi cập nhật màu sắc!',
            }),
        );
    }
});