import config from '@/config/env.config';
import { UnAuthenticatedError } from '@/error/customError';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorizations;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new UnAuthenticatedError('Token: Invalidated access!'));
    }

    const token = authHeader.split(' ')?.[1];

    jwt.verify(token, config.jwt.accessTokenKey, async (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new UnAuthenticatedError('Token has expired.'));
            }
            if (err.name === 'JsonWebTokenError') {
                return next(new UnAuthenticatedError('Invalid token.'));
            }
            return next(new UnAuthenticatedError('Token verification failed.'));
        }

        const { userId, role } = decoded;

        try {
            const user = await User.findById(userId);
            if (!user) {
                return next(new UnAuthenticatedError('Người dùng không tồn tại.'));
            }

            if (!user.isActive) {
                return next(new UnAuthenticatedError('Tài khoản của bạn chưa được kích hoạt.'));
            }

            if (user.isBanned) {
                return next(
                    new UnAuthenticatedError(
                        `Tài khoản của bạn đã bị khóa! Lý do: ${user.bannedReason || 'Không xác định'}. Thời gian khóa: ${
                            user.bannedAt ? new Date(user.bannedAt).toLocaleString('vi-VN') : 'Không xác định'
                        }. Vui lòng liên hệ hỗ trợ qua email: support@vertasport.com.`,
                    ),
                );
            }

            req.userId = userId;
            req.role = role;

            return next();
        } catch (error) {
            return next(new UnAuthenticatedError('Có lỗi xảy ra khi xác thực người dùng.'));
        }
    });
};
