import mongoose from 'mongoose';
import { NotFoundError } from '@/error/customError';
import { Request, Response, NextFunction, RequestHandler } from 'express';

export const validateObjectId: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    if (!req.params) {
        next(new NotFoundError(`Need the request params for this route.`));
    }
    for (const param in req.params) {
        !mongoose.isValidObjectId(req.params[param])
            ? next(new NotFoundError(`Invalid param: ${req.params[param]}`))
            : next();
    }
};
