import config from '@/config/env.config';
import { UnAuthenticatedError } from '@/error/customError';
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorizations;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new UnAuthenticatedError('Token: Invalidated access!'));
    }

    const token = authHeader.split(' ')?.[1];

    jwt.verify(token, config.jwt.accessTokenKey, (err, decoded) => {
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

        req.userId = userId;
        req.role = role;

        return next();
    });
};
