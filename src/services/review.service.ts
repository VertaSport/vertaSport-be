import { BadRequestError, NotAcceptableError, NotFoundError } from '@/error/customError';
import APIQuery, { QueryString } from '@/helpers/apiQuery';
import customResponse from '@/helpers/response';
import Order from '@/models/Order';
import Reviews from '@/models/Reviews';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
    const { orderId, productId } = req.body;

    const order = await Order.findOne({
        _id: orderId,
    });

    if (!order) {
        throw new NotFoundError(`${ReasonPhrases.NOT_FOUND} with order id ${orderId}`);
    }

    const productVariants = order.items.filter((item) => {
        return item.productId.toString() === productId;
    });

    if (productVariants.length === 0) {
        throw new BadRequestError(`${ReasonPhrases.BAD_REQUEST} không tìm thấy sản phẩm với id ${productId}`);
    }

    const isReviewd = productVariants.every((item) => {
        return item.isReviewed === true;
    });

    if (isReviewd) {
        throw new BadRequestError(`${ReasonPhrases.BAD_REQUEST}: Sản phẩm này đã được đánh giá.`);
    }

    const variantsData = productVariants.map((item) => ({
        name: item.name,
        size: item.size,
        color: item.color,
        variantId: item.variantId,
    }));

    const review = new Reviews({
        ...req.body,
        variants: variantsData,
        userId: req.userId,
    });

    await review.save();

    order.items.forEach((item) => {
        if (item.productId.toString() === productId) {
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
    const limit = req.query.limit || 5;
    const query: QueryString = { ...req.query };

    query.page = String(page);
    query.limit = String(limit);

    const features = new APIQuery(
        Reviews.find({
            productId: productId,
            isHided: false,
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
        isHided: false,
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

export const getAllReviews = async (req: Request, res: Response, next: NextFunction) => {
    const page = req.query.page ? +req.query.page : 1;
    const limit = req.query.limit || 10;
    const query: QueryString = { ...req.query };

    query.page = String(page);
    query.limit = String(limit);

    const features = new APIQuery(
        Reviews.find().populate({
            path: 'userId',
            select: 'avatar name',
        }),
        query,
    );

    features.filter().sort().limitFields().paginate().search();

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

export const hiddenReview = async (req: Request, res: Response, next: NextFunction) => {
    const { reviewId } = req.params;

    const reviewFounded = await Reviews.findOneAndUpdate({ _id: reviewId }, { isHided: true });

    if (!reviewFounded) {
        throw new NotFoundError(`Không tìm thấy đánh giá với id ${reviewId}`);
    }

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
            success: true,
        }),
    );
};
export const activeReview = async (req: Request, res: Response, next: NextFunction) => {
    const { reviewId } = req.params;

    const reviewFounded = await Reviews.findOneAndUpdate({ _id: reviewId }, { isHided: false });

    if (!reviewFounded) {
        throw new NotFoundError(`Không tìm thấy đánh giá với id ${reviewId}`);
    }

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
            success: true,
        }),
    );
};
