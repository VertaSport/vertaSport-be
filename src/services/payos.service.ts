import { ORDER_PAYMENT_STATUS } from '@/constant/order';
import { NotFoundError } from '@/error/customError';
import customResponse from '@/helpers/response';
import Cart from '@/models/Cart';
import Order from '@/models/Order';
import PayOS from '@payos/node';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { inventoryService } from '.';

const payOS = new PayOS(
    process.env.PAYOS_CLIENT_ID as string,
    process.env.PAYOS_API_KEY as string,
    process.env.PAYOS_CHECKSUM_KEY as string,
);

export const createPayOsPayment = async (req: Request, res: Response, next: NextFunction) => {
    const { amount, items, cancelUrl, returnUrl } = req.body;
    const orderCode = Number(String(Date.now()).slice(-6));
    const expireAt = 5 * 60; // 5 minutes

    await inventoryService.checkProductStatus(req.body.items);

    await inventoryService.updateStockOnCreateOrder(req.body.items);

    const order = new Order({
        ...req.body,
        userId: req.userId,
        orderCode,
        expiredAt: new Date(Date.now() + expireAt * 1000),
    });

    const saveOrder = await order.save();

    const body = {
        orderCode: orderCode,
        amount,
        description: `Thanh toan don hang`,
        items,
        expiredAt: Math.floor(Date.now() / 1000) + expireAt,
        cancelUrl: `${cancelUrl}/${saveOrder._id}`,
        returnUrl: `${returnUrl}/${saveOrder._id}`,
    };

    const paymentLinkRes = await payOS.createPaymentLink(body);

    const data = {
        checkoutUrl: paymentLinkRes.checkoutUrl,
    };

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: data,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
            success: true,
        }),
    );
};

export const cancelPaymentLink = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await payOS.cancelPaymentLink(id);

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
            success: true,
        }),
    );
};

export const confirmWebhook = async (webhookUrl: string) => {
    try {
        await payOS.confirmWebhook(webhookUrl);
    } catch (error) {
        console.error(`[confirmWebhook] Error confirming webhook for URL ${webhookUrl}:`, error);
    }
};

export const HandlePayOsWebhook = async (req: Request, res: Response, next: NextFunction) => {
    const orderCodeWebHookTest = 123;

    if (req.body && req.body?.data.orderCode !== orderCodeWebHookTest) {
        const webhookData = payOS.verifyPaymentWebhookData(req.body);

        if (webhookData?.code === '00') {
            const orderCode = webhookData.orderCode;
            const foundedOrder = await Order.findOneAndUpdate(
                { orderCode },
                {
                    isPaid: true,
                    orderPaymentStatus: ORDER_PAYMENT_STATUS.SUCCESSED,
                },
                { new: true },
            );
            if (!foundedOrder) {
                throw new NotFoundError(`Không tìm thấy đơn hàng với order code ${orderCode}`);
            }
            await Promise.all(
                foundedOrder.items.map(async (product: any) => {
                    await Cart.updateOne(
                        { userId: foundedOrder.userId },
                        { $pull: { items: { product: product.productId } } },
                    );
                }),
            );
        }
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

// @Post
export const updateStockCancelOrderPayos = async (req: Request, res: Response, next: NextFunction) => {
    const foundedOrder = await Order.findOneAndUpdate(
        {
            _id: req.body.orderId,
            isPaid: false,
            orderPaymentStatus: ORDER_PAYMENT_STATUS.PENDING,
        },
        {
            orderPaymentStatus: ORDER_PAYMENT_STATUS.CANCELLED,
        },
    ).lean();
    if (!foundedOrder) {
        throw new NotFoundError(`${ReasonPhrases.NOT_FOUND} order with id: ${req.body.orderId}`);
    }

    await inventoryService.updateStockOnCancelOrder(foundedOrder.items);

    return res
        .status(StatusCodes.OK)
        .json(customResponse({ data: null, success: true, status: StatusCodes.OK, message: ReasonPhrases.OK }));
};
