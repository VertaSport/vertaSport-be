import Order from '@/models/Order';
import { NextFunction, Request, Response } from 'express';
import { inventoryService } from '.';
import { sendMail } from '@/utils/sendMail';
import Cart from '@/models/Cart';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import customResponse from '@/helpers/response';
import APIQuery from '@/helpers/apiQuery';
import { BadRequestError } from '@/error/customError';
import Variant from '@/models/Variant';
import _ from 'lodash';

// @ GET ALL ORDER
export const getAllOrdersByUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const page = req.query.page ? +req.query.page : 1;
    req.query.limit = String(req.query.limit || 10);

    const features = new APIQuery(Order.find({ userId }), req.query);
    features.filter().sort().limitFields().search().paginate();

    const [orders, totalDocs] = await Promise.all([features.query, features.count()]);
    const totalPages = Math.ceil(Number(totalDocs) / +req.query.limit);
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: {
                orders,
                page,
                totalDocs,
                totalPages,
            },
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
};
// @ CREATE ORDER

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    const order = new Order({
        ...req.body,
        userId: req.userId,
    });
    await order.save();
    const template = {
        content: {
            title: 'Đơn hàng mới của bạn',
            description: 'Bạn vừa mới đặt một đơn hàng từ VERTA SPORT dưới đây là sản phẩm bạn đã đặt:',
            email: req.body.customerInfo.email,
        },
        product: {
            items: req.body.items,
            shippingfee: req.body.shippingFee,
            totalPrice: req.body.totalPrice,
        },
        subject: '[VERTAR SPORT] - Đơn hàng mới của bạn',
        link: {
            linkHerf: `http://localhost:3000/my-orders/${order._id}`,
            linkName: `Kiểm tra đơn hàng`,
        },
        user: {
            name: req.body.customerInfo.name,
            phone: req.body.customerInfo.phone,
            email: req.body.customerInfo.email,
            address: `[${req.body.shippingAddress.address}] - ${req.body.shippingAddress.ward}, ${req.body.shippingAddress.district}, ${req.body.shippingAddress.province}, Việt Nam`,
        },
    };
    // Update stock
    await inventoryService.updateStockOnCreateOrder(req.body.items);
    await sendMail({ email: req.body.customerInfo.email, template, type: 'UpdateStatusOrder' });
    await Promise.all(
        req.body.items.map(async (product: any) => {
            await Cart.findOneAndUpdate(
                { userId: req.userId },
                { $pull: { items: { product: product.productId } } },
                { new: true },
            );
        }),
    );
    return res
        .status(StatusCodes.OK)
        .json(customResponse({ data: req.body, success: true, status: StatusCodes.OK, message: ReasonPhrases.OK }));
};

// @ GET DETAILED ORDER
export const getDetailedOrder = async (req: Request, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
        throw new BadRequestError(`${ReasonPhrases.NOT_FOUND} order with id: ${req.params.id}`);
    }
    const result = _.omit(order, ['updatedAt']);
    const response = {
        ...result,
    };

    return res
        .status(StatusCodes.OK)
        .json(customResponse({ data: response, success: true, status: StatusCodes.OK, message: ReasonPhrases.OK }));
};
