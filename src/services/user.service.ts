import { BadRequestFormError, UnAuthenticatedError } from '@/error/customError';
import customResponse from '@/helpers/response';
import User from '@/models/User';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import APIQuery from '@/helpers/apiQuery';
import mongoose from 'mongoose';
import { Content, templateMail } from '@/template/Mailtemplate';
import { sendMail } from '@/utils/sendMail';

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

// @Get: getAllUsers
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    const page = req.query.page ? +req.query.page : 1;
    req.query.limit = String(req.query.limit || 10);

    const features = new APIQuery(
        User.find({ role: 'user' })
            .select('-password')
            .select('name email phone isActive isBanned bannedReason bannedAt createdAt updatedAt'),
        req.query,
    );

    features.filter().sort().limitFields().search().paginate();

    const [data, totalDocs] = await Promise.all([features.query, features.count()]);
    const totalPages = Math.ceil(Number(totalDocs) / +req.query.limit);

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: {
                users: data,
                page: page,
                totalDocs: totalDocs,
                totalPages: totalPages,
            },
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
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

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const { name, email, avatar, avatarRef, phone } = req.body;

    if (!name || !email) {
        throw new BadRequestFormError('Lỗi form', {
            field: 'name or email',
            message: 'Tên và email là bắt buộc',
        });
    }

    const updatedUser = await User.findOneAndUpdate(
        { _id: userId, isActive: true },
        { name, email, avatar, avatarRef, phone },
        { new: true, runValidators: true },
    );

    if (!updatedUser) {
        throw new UnAuthenticatedError('Tài khoản này không tồn tại hoặc chưa được kích hoạt');
    }

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: updatedUser,
            message: 'Cập nhật thông tin người dùng thành công',
            status: StatusCodes.OK,
            success: true,
        }),
    );
};

// @Patch: banUser
export const banUser = async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.userId;
    const { userId, reason } = req.body;

    if (!userId || !reason) {
        throw new BadRequestFormError('Lỗi form', {
            field: 'userId or reason',
            message: 'User ID và lý do khóa là bắt buộc',
        });
    }

    const admin = await User.findOne({ _id: adminId, role: 'admin' });
    if (!admin) {
        throw new UnAuthenticatedError('Bạn không có quyền thực hiện hành động này');
    }

    const user = await User.findOne({ _id: userId, role: 'user' });
    if (!user) {
        throw new BadRequestFormError('Lỗi', {
            field: 'userId',
            message: 'Người dùng không tồn tại',
        });
    }

    if (user.isBanned) {
        throw new BadRequestFormError('Lỗi', {
            field: 'userId',
            message: 'Tài khoản này đã bị khóa trước đó',
        });
    }

    user.isBanned = true;
    user.bannedReason = reason;
    user.bannedAt = new Date();
    user.banHistory.push({
        action: 'ban',
        adminId: new mongoose.Types.ObjectId(adminId),
        adminName: admin.name,
        adminEmail: admin.email,
        reason,
        timestamp: new Date(),
    });

    await user.save();

    const template = {
        content: {
            title: 'Tài Khoản Của Bạn Đã Bị Khóa',
            description:
                'Chúng tôi rất tiếc phải thông báo rằng tài khoản của bạn đã bị khóa do vi phạm chính sách của Verta Sport.',
            email: user.email,
            reason: reason,
            bannedAt: user.bannedAt,
        },
        link: {
            linkHerf: 'mailto:support@vertasport.com',
            linkName: 'Liên Hệ Hỗ Trợ',
        },
        subject: '[Verta-Sport] - Tài Khoản Của Bạn Đã Bị Khóa',
    };
    await sendMail({
        email: user.email,
        template,
        type: 'BanAccount',
    });

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: user,
            message: 'Khóa tài khoản người dùng thành công',
            status: StatusCodes.OK,
            success: true,
        }),
    );
};

// @Patch: unbanUser
export const unbanUser = async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.userId;
    const { userId } = req.body;

    if (!userId) {
        throw new BadRequestFormError('Lỗi form', {
            field: 'userId',
            message: 'User ID là bắt buộc',
        });
    }

    const admin = await User.findOne({ _id: adminId, role: 'admin' });
    if (!admin) {
        throw new UnAuthenticatedError('Bạn không có quyền thực hiện hành động này');
    }

    const user = await User.findOne({ _id: userId, role: 'user' });
    if (!user) {
        throw new BadRequestFormError('Lỗi', {
            field: 'userId',
            message: 'Người dùng không tồn tại',
        });
    }

    if (!user.isBanned) {
        throw new BadRequestFormError('Lỗi', {
            field: 'userId',
            message: 'Tài khoản này không bị khóa',
        });
    }

    user.isBanned = false;
    user.bannedReason = null;
    user.bannedAt = null;
    user.banHistory.push({
        action: 'unban',
        adminId: new mongoose.Types.ObjectId(adminId),
        adminName: admin.name,
        adminEmail: admin.email,
        timestamp: new Date(),
    });

    await user.save();

    const template = {
        content: {
            title: 'Tài Khoản Của Bạn Đã Được Mở Khóa',
            description:
                'Chúng tôi rất vui thông báo rằng tài khoản của bạn đã được mở khóa. Bạn có thể tiếp tục sử dụng các dịch vụ của Verta Sport.',
            email: user.email,
        },
        link: {
            linkHerf: 'http://localhost:3000/login',
            linkName: 'Đăng Nhập Ngay',
        },
        subject: '[Verta-Sport] - Tài Khoản Của Bạn Đã Được Mở Khóa',
    };
    await sendMail({
        email: user.email,
        template,
        type: 'UnbanAccount',
    });

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: user,
            message: 'Mở khóa tài khoản người dùng thành công',
            status: StatusCodes.OK,
            success: true,
        }),
    );
};
// @Get: getUserBanHistory
export const getUserBanHistory = async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.userId;
    const { userId } = req.query;

    if (!userId) {
        throw new BadRequestFormError('Lỗi query', {
            field: 'userId',
            message: 'User ID là bắt buộc',
        });
    }

    const admin = await User.findOne({ _id: adminId, role: 'admin' });
    if (!admin) {
        throw new UnAuthenticatedError('Bạn không có quyền thực hiện hành động này');
    }

    const user = await User.findOne({ _id: userId, role: 'user' }).select('banHistory');
    if (!user) {
        throw new BadRequestFormError('Lỗi', {
            field: 'userId',
            message: 'Người dùng không tồn tại',
        });
    }

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: user.banHistory,
            message: 'Lấy lịch sử khóa/mở khóa thành công',
            status: StatusCodes.OK,
            success: true,
        }),
    );
};
