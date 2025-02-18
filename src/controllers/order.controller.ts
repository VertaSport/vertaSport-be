import asyncHandler from '@/helpers/asyncHandler';
import { orderService } from '@/services';
import { NextFunction, Request, Response } from 'express';
// @ CREATE ORDER
export const createOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await orderService.createOrder(req, res, next);
});
// @ GET MY ORDER
export const getMyOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await orderService.getAllOrdersByUser(req, res, next);
});
// @ GET DETAIL ORDER
export const getDetailOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await orderService.getDetailedOrder(req, res, next);
});
