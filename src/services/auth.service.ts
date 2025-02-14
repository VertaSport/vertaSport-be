import { BadRequestError, BadRequestFormError, UnAuthenticatedError } from '@/error/customError';
import customResponse from '@/helpers/response';
import User from '@/models/User';
import { sendMail } from '@/utils/sendMail';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import _ from 'lodash';
import { deleteToken, generateAuthTokens, generateToken, saveToken } from './token.service';
import { tokenTypes } from '@/constant/token';
import config from '@/config/env.config';
import jwt, { JwtPayload } from 'jsonwebtoken';

// @ REGISTER
export const register = async (req: Request, res: Response, next: NextFunction) => {
    const fields = [
        { key: 'email', message: 'Email này đã tồn tại!' },
        { key: 'userName', message: 'Tên người dùng này đã tồn tại!' },
    ];
    const results = await Promise.all(fields.map(({ key }) => User.findOne({ [key]: req.body[key] })));
    const errors = fields
        .map((field, index) => (results[index] ? { message: field.message, field: field.key } : null))
        .filter(Boolean) as { message: string; field: string }[];
    if (errors.length > 0) {
        throw new BadRequestFormError('Có lỗi trùng lặp', errors);
    }
    const newUser = await User.create({ ...req.body });
    const token = await generateToken(newUser, config.jwt.verifyTokenKey, config.jwt.verifyExpiration);
    await saveToken(token, newUser._id, tokenTypes.VERIFY_EMAIL);
    const contentEmail = {
        subject: '[VERTASPORT] - Kích Hoạt Tài Khoản',
        content: {
            title: 'Kích Hoạt Tài Khoản Của Bạn',
            warning: 'Nếu bạn không kích hoạt tài khoản, bạn sẽ không sử dụng được toàn bộ dịch vụ của chúng tôi',
            description:
                'Cảm ơn bạn vì đã lựa chọn VERTA SPORT! Để hoàn tất việc đăng ký tài khoản, vui lòng nhấn vào đường dẫn dưới đây:',
            email: req.body.email,
        },
        link: {
            linkName: 'Kích Hoạt Tài Khoản',
            linkHerf: `http://localhost:3000/verifyAccount?tk=${token}&email=${newUser.email}`,
        },
    };
    sendMail({ email: req.body.email, template: contentEmail, type: 'Verify' });
    return res.status(StatusCodes.CREATED).json(
        customResponse({
            data: newUser,
            message: 'Đăng ký tài khoản thành công',
            status: StatusCodes.CREATED,
            success: true,
        }),
    );
};

// @ LOGIN
export const login = async (req: Request, res: Response, next: NextFunction) => {
    const foundedUser = await User.findOne({ email: req.body.email });
    if (!foundedUser) {
        throw new BadRequestFormError('Có lỗi xảy ra', {
            message: 'Tài khoản không tồn tại trong hệ thống!',
            field: 'email',
        });
    }
    if (!foundedUser.isActive) {
        throw new BadRequestFormError(
            'Có lỗi xảy ra',
            {
                message: 'Tài khoản bạn chưa được kích hoạt!',
                field: 'email',
            },
            StatusCodes.UNAUTHORIZED,
        );
    }
    const isMatchedPassword = await bcrypt.compare(req.body.password, foundedUser?.password);
    if (!isMatchedPassword) {
        throw new BadRequestFormError('Có lỗi xảy ra', {
            message: 'Mật khẩu hoặc tài khoản không đúng!',
            field: 'password',
        });
    }
    const user = _.pick(foundedUser, ['_id', 'name', 'email', 'role', 'avatar', 'avatarRef']);
    const { accessToken } = await generateAuthTokens(foundedUser);
    return res.status(StatusCodes.ACCEPTED).json(
        customResponse({
            data: { ...user, accessToken },
            message: 'Đăng nhập thành công',
            status: StatusCodes.ACCEPTED,
            success: true,
        }),
    );
};

// @ VERIFY
export const sendMailverifyAccount = async (req: Request, res: Response, next: NextFunction) => {
    const checkedEmail = await User.findOne({ email: req.body.email });
    if (checkedEmail?.isActive) {
        await deleteToken(checkedEmail._id, tokenTypes.VERIFY_EMAIL);
        throw new BadRequestFormError('Có lỗi xảy ra', {
            message: 'Tài khoản này đã được kích hoạt',
            field: 'email',
        });
    }
    if (!checkedEmail) {
        throw new BadRequestFormError('Có lỗi xảy ra', {
            message: 'Tài khoản không tồn tại trong hệ thống!',
            field: 'email',
        });
    }
    await deleteToken(checkedEmail._id, tokenTypes.VERIFY_EMAIL);
    const newToken = await generateToken(checkedEmail, config.jwt.verifyTokenKey, config.jwt.verifyExpiration);
    await saveToken(newToken, checkedEmail._id, tokenTypes.VERIFY_EMAIL);
    const contentEmail = {
        subject: '[VERTASPORT] - Kích Hoạt Tài Khoản',
        content: {
            title: 'Kích Hoạt Tài Khoản Của Bạn',
            warning: 'Nếu bạn không kích hoạt tài khoản, bạn sẽ không sử dụng được toàn bộ dịch vụ của chúng tôi',
            description:
                'Cảm ơn bạn vì đã lựa chọn VERTA SPORT! Để hoàn tất việc đăng ký tài khoản, vui lòng nhấn vào đường dẫn dưới đây:',
            email: req.body.email,
        },
        link: {
            linkName: 'Kích Hoạt Tài Khoản',
            linkHerf: `http://localhost:3000/verifyAccount?tk=${newToken}&email=${checkedEmail.email}`,
        },
    };
    sendMail({ email: req.body.email, template: contentEmail, type: 'Verify' });
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            message: 'Vui Lòng Kiểm Tra Email',
            success: true,
            status: StatusCodes.NO_CONTENT,
        }),
    );
};

// @ VERIFY ACCOUNT
export const verifyAccount = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.body.token;
    jwt.verify(token, config.jwt.verifyTokenKey, async (err: any, decoded: any) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new UnAuthenticatedError('Mã đã hết hạn'));
            }
            if (err.name === 'JsonWebTokenError') {
                return next(new UnAuthenticatedError('Mã không hợp lệ'));
            }
            return next(new UnAuthenticatedError('Xác thực thất bại vui lòng thử lại!'));
        }
        const { userId } = decoded as JwtPayload;
        await User.findByIdAndUpdate(userId, { isActive: true });
        await deleteToken(userId, tokenTypes.VERIFY_EMAIL);
        return res.status(StatusCodes.ACCEPTED).json(
            customResponse({
                data: null,
                status: StatusCodes.ACCEPTED,
                success: true,
                message: 'Tài khoản của bạn đã được kích hoạt thành công',
            }),
        );
    });
};
