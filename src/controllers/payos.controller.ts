import asyncHandler from '@/helpers/asyncHandler';
import { payosService } from '@/services';
import { NextFunction, Request, Response } from 'express';

export const createPayOsPayment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await payosService.createPayOsPayment(req, res, next);
});

export const cancelPaymentLink = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await payosService.cancelPaymentLink(req, res, next);
});
export const HandlePayOsWebhook = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await payosService.HandlePayOsWebhook(req, res, next);
});
export const updateStockCancelOrderPayos = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await payosService.updateStockCancelOrderPayos(req, res, next);
});
