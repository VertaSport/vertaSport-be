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
// @ GET ALL ORDER
export const getAllOrders = asyncHandler(async (req, res, next) => {
    return await orderService.getAllOrders(req, res, next);
});
export const cancelOrder = asyncHandler(async (req, res, next) => {
    return await orderService.cancelOrder(req, res, next);
});
export const confirmOrder = asyncHandler(async (req, res, next) => {
    return await orderService.confirmOrder(req, res, next);
});
export const shippingOrder = asyncHandler(async (req, res, next) => {
    return await orderService.shippingOrder(req, res, next);
});
export const finishOrder = asyncHandler(async (req, res, next) => {
    return await orderService.finishOrder(req, res, next);
});
export const deliverOrder = asyncHandler(async (req, res, next) => {
    return await orderService.deliverOrder(req, res, next);
});
