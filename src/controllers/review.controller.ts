import asyncHandler from '@/helpers/asyncHandler';
import { reviewsService } from '@/services';
import { NextFunction, Request, Response } from 'express';

export const createReview = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await reviewsService.createReview(req, res, next);
});
export const getALlReviewsProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await reviewsService.getAllReviewsProduct(req, res, next);
});
export const useGetAllReviewStar = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await reviewsService.useGetAllReviewStar(req, res, next);
});
export const getAllReviews = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await reviewsService.getAllReviews(req, res, next);
});
export const hiddenReview = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await reviewsService.hiddenReview(req, res, next);
});
export const activeReview = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await reviewsService.activeReview(req, res, next);
});
