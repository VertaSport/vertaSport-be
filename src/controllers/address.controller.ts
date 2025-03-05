import asyncHandler from '@/helpers/asyncHandler';
import { addressService } from '@/services';
import { NextFunction, Request, Response } from 'express';

export const getAllAddressByUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await addressService.getAllAddressByUser(req, res, next);
});

export const getDetailAddress = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await addressService.getDetailAddress(req, res, next);
});

export const createAddress = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await addressService.createAddress(req, res, next);
});

export const updateAddress = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await addressService.updateAddress(req, res, next);
});

export const setDefaultAddress = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await addressService.setDefaultAddress(req, res, next);
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await addressService.deleteAddress(req, res, next);
});
