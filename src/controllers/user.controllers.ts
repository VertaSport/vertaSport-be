import asyncHandler from '@/helpers/asyncHandler';
import customResponse from '@/helpers/response';
import { userService } from '@/services';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

// @Get: getUserProfile
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const profileData = await userService.getUserProfile(req, res);
    return res
        .status(StatusCodes.OK)
        .json(customResponse({ data: profileData, message: ReasonPhrases.OK, status: StatusCodes.OK, success: true }));
});
