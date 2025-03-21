import asyncHandler from '../helpers/asyncHandler';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import customResponse from '../helpers/response';
import { statsService } from '@/services';

export const totalStats = asyncHandler(async (req, res, next) => {
    const stats = await statsService.totalStats(req, res, next);
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: stats,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});
export const pendingTask = asyncHandler(async (req, res, next) => {
    const stats = await statsService.getDashboardStats(req, res, next);
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: stats,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});
export const orderByDateRangeStats = asyncHandler(async (req, res, next) => {
    const stats = await statsService.orderByDateRangeStats(req, res, next);
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: stats,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});
export const getProductStats = asyncHandler(async (req, res, next) => {
    const stats = await statsService.getProductStats(req, res, next);
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: stats,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});
export const getTop5Buyers = asyncHandler(async (req, res, next) => {
    const stats = await statsService.findTop5Buyers(req, res, next);
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: stats,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});
