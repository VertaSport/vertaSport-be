import { ORDER_PAYMENT_STATUS, ORDER_STATUS } from '@/constant/order';
import { NotFoundError } from '@/error/customError';
import customResponse from '@/helpers/response';
import Cart from '@/models/Cart';
import Order from '@/models/Order';
import PayOS from '@payos/node';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { inventoryService, voucherService } from '.';
import config from '@/config/env.config';
import User from '@/models/User';
import { sendMail } from '@/utils/sendMail';

const payOS = new PayOS(config.payos.clientId, config.payos.apiKey, config.payos.checksumKey);
type orderPaymentTimeout = {
    timeoutId: NodeJS.Timeout;
    orderId: string;
};
const orderPaymentTimeoutId: orderPaymentTimeout[] = [];

export const createPayOsPayment = async (req: Request, res: Response, next: NextFunction) => {
    await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 900) + 100));
    const { amount, items, cancelUrl, returnUrl } = req.body;
    const orderCode = Number(String(Date.now()).slice(-6));
    const expireAt = 5 * 60; // 5 minutes
    const voucherCode = req.body.voucherCode;
    const userId = req.userId;
    const totalPriceNoShip = req.body.totalPrice - 30000;
    let totalPrice = totalPriceNoShip;
    let discountType = 'fixed';
    let voucherName = '';
    let voucherDiscount = 0;
    if (voucherCode) {
        const voucherData = await voucherService.checkVoucherIsValid(voucherCode, userId, totalPrice, 30000);
        voucherName = voucherData.voucherName;
        voucherDiscount = voucherData.voucherDiscount;
        totalPrice = voucherData.totalPrice;
        discountType = voucherData.discountType;
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
        throw new NotFoundError(`Không tìm thấy người dùng với id: ${userId}`);
    }
    await inventoryService.checkProductStatus(items);

    const order = new Order({
        ...req.body,
        userId: userId,
        orderCode,
        orderPaymentCode: orderCode,
        voucherCode,
        voucherName,
        voucherDiscount,
        expiredAt: new Date(Date.now() + expireAt * 1000),
        totalPrice,
        discountType,
    });

    const saveOrder = await order.save();

    const paymentTimeoutId = setTimeout(async () => {
        await Order.findOneAndUpdate(
            {
                _id: saveOrder._id,
                isPaid: false,
                orderPaymentStatus: ORDER_PAYMENT_STATUS.PENDING,
            },
            {
                orderPaymentStatus: ORDER_PAYMENT_STATUS.CANCELLED,
                orderStatus: ORDER_STATUS.CANCELLED,
                description: 'Thời gian thanh toán đã hết hạn!',
            },
        );

        await inventoryService.updateStockOnCancelOrder(items);
        await voucherService.rollbackVoucher(voucherCode, userId);
    }, expireAt * 1000);

    orderPaymentTimeoutId.push({
        orderId: saveOrder._id,
        timeoutId: paymentTimeoutId,
    });

    const body = {
        orderCode: orderCode,
        amount: totalPrice,
        description: `Thanh toan don hang`,
        items,
        expiredAt: Math.floor(Date.now() / 1000) + expireAt,
        cancelUrl: `${cancelUrl}/${saveOrder._id}`,
        returnUrl: `${returnUrl}/${saveOrder._id}`,
    };

    const paymentLinkRes = await payOS.createPaymentLink(body);

    await inventoryService.updateStockOnCreateOrder(items);

    const now = new Date();

    if (currentUser.userIsOldWhen > now) {
        await User.findByIdAndUpdate(userId, { $set: { userIsOldWhen: new Date() } });
    }

    await User.findByIdAndUpdate(userId, { $set: { userIsOldWhen: new Date() } });

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
                { orderPaymentCode: orderCode, isPaid: false, orderPaymentStatus: ORDER_PAYMENT_STATUS.PENDING },
                {
                    isPaid: true,
                    orderPaymentStatus: ORDER_PAYMENT_STATUS.SUCCESSED,
                    description: 'Thanh toán thành công!',
                },
                { new: true },
            );

            if (!foundedOrder) {
                throw new NotFoundError(`Không tìm thấy đơn hàng với order code ${orderCode}`);
            }

            const foundedUser = await User.findById(foundedOrder.userId);

            if (!foundedUser) {
                throw new NotFoundError(`Không tìm thấy người dùng với ${foundedOrder.userId}`);
            }

            const template = {
                content: {
                    title: 'Đơn hàng mới của bạn',
                    description: 'Bạn vừa mới đặt một đơn hàng từ VERTA SPORT dưới đây là sản phẩm bạn đã đặt:',
                    email: foundedUser.email,
                },
                product: {
                    items: foundedOrder.items,
                    shippingfee: foundedOrder.shippingFee,
                    totalPrice: foundedOrder.totalPrice,
                },
                subject: '[VERTAR SPORT] - Đơn hàng mới của bạn',
                voucher: {
                    name: foundedOrder.voucherCode,
                    discount: foundedOrder.voucherDiscount,
                    code: foundedOrder.voucherCode,
                },
                link: {
                    linkHerf: `http://localhost:3000/account/my-orders/${foundedOrder._id}`,
                    linkName: `Kiểm tra đơn hàng`,
                },
                user: {
                    name: foundedUser.name,
                    phone: foundedUser.phone,
                    email: foundedUser.email,
                    address: `[${foundedOrder.shippingAddress.address}] - ${foundedOrder.shippingAddress.ward}, ${foundedOrder.shippingAddress.district}, ${foundedOrder.shippingAddress.province}, Việt Nam`,
                },
            };

            await sendMail({ email: foundedUser.email, template, type: 'UpdateStatusOrder' });

            await Promise.all(
                foundedOrder.items.map(async (product: any) => {
                    await Cart.updateOne(
                        { userId: foundedOrder.userId },
                        { $pull: { items: { product: product.productId } } },
                    );
                }),
            );

            const foundedOrderTimeOut = orderPaymentTimeoutId.findIndex((timeoutItem) => {
                return timeoutItem.orderId === foundedOrder._id;
            });

            if (foundedOrderTimeOut !== -1) {
                clearTimeout(orderPaymentTimeoutId?.[foundedOrderTimeOut].timeoutId);
                orderPaymentTimeoutId.splice(foundedOrderTimeOut, 1);
            }
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
            orderStatus: ORDER_STATUS.CANCELLED,
            description: 'Thanh toán thất bại!',
        },
    ).lean();

    if (!foundedOrder) {
        throw new NotFoundError(`${ReasonPhrases.NOT_FOUND} order with id: ${req.body.orderId}`);
    }

    await inventoryService.updateStockOnCancelOrder(foundedOrder.items);

    const foundedOrderTimeOut = orderPaymentTimeoutId.findIndex((timeoutItem) => {
        return timeoutItem.orderId === foundedOrder._id;
    });

    if (foundedOrderTimeOut !== -1) {
        clearTimeout(orderPaymentTimeoutId?.[foundedOrderTimeOut].timeoutId);
        orderPaymentTimeoutId.splice(foundedOrderTimeOut, 1);
    }

    return res
        .status(StatusCodes.OK)
        .json(customResponse({ data: null, success: true, status: StatusCodes.OK, message: ReasonPhrases.OK }));
};
