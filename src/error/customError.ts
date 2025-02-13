import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { HttpException } from './HttpException';

export class NotFoundError extends HttpException {
    public status: number;
    public name: string;

    constructor(message: string) {
        super(message);
        this.name = ReasonPhrases.NOT_FOUND;
        this.status = StatusCodes.NOT_FOUND;
    }
}
export class BadRequestError extends HttpException {
    public status: number;
    public name: string;

    constructor(message: string) {
        super(message);
        this.name = ReasonPhrases.BAD_REQUEST;
        this.status = StatusCodes.BAD_REQUEST;
    }
}
export class DuplicateError extends HttpException {
    public status: number;
    public name: string;

    constructor(message: string) {
        super(message);
        this.name = ReasonPhrases.CONFLICT;
        this.status = StatusCodes.CONFLICT;
    }
}
export class UnAuthenticatedError extends HttpException {
    public status: number;
    public name: string;

    constructor(message: string) {
        super(message);
        this.name = ReasonPhrases.UNAUTHORIZED;
        this.status = StatusCodes.UNAUTHORIZED;
    }
}
export class UnAuthorizedError extends HttpException {
    public status: number;
    public name: string;

    constructor(message: string) {
        super(message);
        this.name = ReasonPhrases.FORBIDDEN;
        this.status = StatusCodes.FORBIDDEN;
    }
}

export class NotAcceptableError extends HttpException {
    public status: number;
    public name: string;

    constructor(message: string) {
        super(message);
        this.name = ReasonPhrases.NOT_ACCEPTABLE;
        this.status = StatusCodes.NOT_ACCEPTABLE;
    }
}
