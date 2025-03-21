import asyncHandler from '@/helpers/asyncHandler';
import { userService } from '@/services';
import { NextFunction, Request, Response } from 'express';

// @ ROOT ENDPOINT /user

// @ GET PROFILE /private
export const getProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await userService.getProfile(req, res, next);
});

// @ CHANGE PASSWORD /change-password
export const changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await userService.changePassword(req, res, next);
});

// @ UPDATE USER /update
export const updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await userService.updateUser(req, res, next);
});
