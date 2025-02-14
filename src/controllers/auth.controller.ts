import asyncHandler from '@/helpers/asyncHandler';
import { authService } from '@/services';
import { NextFunction, Request, Response } from 'express';

// @ REGISTER CONTROLLER
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await authService.register(req, res, next);
});

// @ LOGIN CONTROLLER
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await authService.login(req, res, next);
});

// @ SEND VERIFY
export const sendVerify = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await authService.sendMailverifyAccount(req, res, next);
});

// @ VERIFY ACCOUNT
export const verifyAccount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return await authService.verifyAccount(req, res, next);
});
