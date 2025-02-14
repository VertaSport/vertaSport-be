import { BadRequestError } from '@/error/customError';
import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

const rateLimitMiddleware = (timeWindow: number, maxRequest: number) => {
    return rateLimit({
        windowMs: timeWindow * 1000,
        max: maxRequest,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req: Request, res: Response, next: NextFunction) => {
            const retryAfterHeader = res.getHeader('Retry-After');
            let timeLeft = timeWindow;
            if (retryAfterHeader) {
                timeLeft = Math.max(parseInt(retryAfterHeader as string, 10), 1);
            }
            throw new BadRequestError(`Thử lại sau ${timeLeft} giây`);
        },
    });
};

export default rateLimitMiddleware;
