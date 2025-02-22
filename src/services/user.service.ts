import { BadRequestFormError, UnAuthenticatedError } from '@/error/customError';
import customResponse from '@/helpers/response';
import User from '@/models/User';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const foundedUser = await User.findOne({ _id: userId, isActive: true }).select('-createdAt -updatedAt');
    if (!foundedUser) {
        throw new UnAuthenticatedError('Bạn chưa đăng nhập hoặc k có tài khoản này trong hệ thống');
    }
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: foundedUser,
            message: 'Lấy thông tin người dùng thành công',
            status: StatusCodes.OK,
            success: true,
        }),
    );
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    const foundedUser = await User.findOne({ _id: req.userId, isActive: true });
    if (!foundedUser) {
        throw new UnAuthenticatedError('Tài khoản này không tồn tại hoặc chưa được kích hoạt');
    }
    const isMatchedPassword = await bcrypt.compare(req.body.oldPassword, foundedUser?.password);
    if (!isMatchedPassword) {
        throw new BadRequestFormError('Lỗi form', {
            field: 'oldPassword',
            message: 'Mật khẩu cũ không đúng vui lòng kiểm tra lại!',
        });
    }
    const isMatchedNewPassword = await bcrypt.compare(req.body.newPassword, foundedUser?.password);
    if (isMatchedNewPassword) {
        throw new BadRequestFormError('Lỗi form', {
            field: 'newPassword',
            message: 'Mật khẩu mới trùng với mật khẩu cũ!',
        });
    }
    const saltRounds = 10;
    const newHashPassword = await bcrypt.hash(req.body.newPassword, saltRounds);
    await User.findByIdAndUpdate(req.userId, { password: newHashPassword }, { new: true });
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            message: 'Đổi mật khẩu thành công',
            status: StatusCodes.OK,
            success: true,
        }),
    );
};
