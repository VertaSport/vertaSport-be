import { BadRequestError, NotAcceptableError, NotFoundError } from '@/error/customError';
import APIQuery, { QueryString } from '@/helpers/apiQuery';
import customResponse from '@/helpers/response';
import Order from '@/models/Order';
import Reviews from '@/models/Reviews';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
    const { orderId, variantId } = req.body;

    const order = await Order.findOne({
        _id: orderId,
    });

    if (!order) {
        throw new NotFoundError(`${ReasonPhrases.NOT_FOUND} with order id ${orderId}`);
    }

    const variant = order.items.find((item) => {
        return item.variantId.toString() === variantId;
    });

    if (!variant) {
        throw new NotFoundError(`${ReasonPhrases.NOT_FOUND} with item in order with variant id ${variantId}`);
    }

    if (variant.isReviewed || variant.isReviewDisabled) {
        throw new BadRequestError(`${ReasonPhrases.BAD_REQUEST}: This variant has already been reviewed.`);
    }

    const review = new Reviews({
        ...req.body,
        variant: {
            name: variant.name,
            size: variant.size,
            color: variant.color,
        },
        userId: req.userId,
    });

    await review.save();

    order.items.forEach((item) => {
        if (item.variantId.toString() === variantId) {
            item.isReviewed = true;
        }
    });

    await order.save();

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
            success: true,
        }),
    );
};

export const getAllReviewsProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const page = req.query.page ? +req.query.page : 1;
    const limit = req.query.limit || 10;
    const query: QueryString = { ...req.query };

    query.page = String(page);
    query.limit = String(limit);

    const features = new APIQuery(
        Reviews.find({
            productId: productId,
        }).populate({
            path: 'userId',
            select: 'avatar name',
        }),
        query,
    );

    features.filter().sort().limitFields().paginate();

    const [data, totalDocs] = await Promise.all([features.query, features.count()]);
    const totalPages = Math.ceil(totalDocs / Number(limit));

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: {
                data: {
                    data: data,
                },
                totalPages,
                totalDocs,
            },
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
            success: true,
        }),
    );
};

export const useGetAllReviewStar = async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    const reviewsStar = await Reviews.find({
        productId: productId,
    })
        .select('rating')
        .lean();
    const reviewsCount = reviewsStar.length;
    const everage = (reviewsStar.reduce((acc, curr) => acc + curr.rating, 0) / reviewsCount).toFixed(1);

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: {
                reviewsStar,
                everage: parseFloat(everage),
            },
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
            success: true,
        }),
    );
};
