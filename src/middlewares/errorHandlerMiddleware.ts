import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

const errorHandler: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = err.message || ReasonPhrases.INTERNAL_SERVER_ERROR;
    const name = err.name;
    const stack = err.stack;

    res.status(status).json({
        data: null,
        success: false,
        status: status,
        name: name,
        message: message,
        stack: stack,
    });
};

export default errorHandler;
