import { NotFoundError } from '@/error/customError';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const err = new NotFoundError('This route does not exist.');
    err.status = StatusCodes.NOT_FOUND;
    next(err);
};

export default notFoundHandler;
