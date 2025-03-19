import asyncHandler from '@/helpers/asyncHandler';
import Voucher from '@/models/Voucher';
import { Request, Response } from 'express';

export const getProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await userServic.getProfile(req, res, next);
});
