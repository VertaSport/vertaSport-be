import Order from '@/models/Order';
import { NextFunction, Request, Response } from 'express';
import { inventoryService, voucherService } from '.';
import { sendMail } from '@/utils/sendMail';
import Cart from '@/models/Cart';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import customResponse from '@/helpers/response';
import APIQuery from '@/helpers/apiQuery';
import { BadRequestError, NotAcceptableError, NotFoundError } from '@/error/customError';
import Variant from '@/models/Variant';
import _ from 'lodash';
import { ORDER_STATUS, PAYMENT_METHOD } from '@/constant/order';
import { ROLE } from '@/constant/allowedRoles';
import User from '@/models/User';
import Voucher from '@/models/Voucher';
import UsedVoucher from '@/models/UsedVoucher';

// @ GET ALL ORDER
export const getAllOrders = async (req, res, next) => {
    const page = req.query.page ? +req.query.page : 1;
    req.query.limit = String(req.query.limit || 10);
    const searchString = req.query.rawsearch;
    const searchQuery = searchString ? { 'customerInfo.name': { $regex: searchString, $options: 'i' } } : {};
    const features = new APIQuery(Order.find(searchQuery), req.query);
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

export const getAllOrdersByUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const page = req.query.page ? +req.query.page : 1;
    req.query.limit = String(req.query.limit || 10);
    req.query.isDeleteForUser = 'false';

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
    const orderCode = Number(String(Date.now()).slice(-6));
    const userId = req.userId;
    const voucherCode = req.body.voucherCode;
    let totalPrice = req.body.totalPrice;
    let shippingFee = 0;
    let isVoucherForNewUser = false;
    let discountType = '';
    if (req.body.shippingFee) {
        shippingFee = req.body.shippingFee;
    }
    const totalPriceNoShip = req.body.totalPrice - shippingFee;
    let voucherName = '';
    let voucherDiscount = 0;
    const currentUser = await User.findById(userId);
    if (!currentUser) {
        throw new NotFoundError(`Không tìm thấy người dùng với id: ${userId}`);
    }

    // Check voucher
    if (voucherCode) {
        const data = await voucherService.checkVoucherIsValid(voucherCode, userId, totalPriceNoShip, shippingFee);
        voucherName = data.voucherName;
        voucherDiscount = data.voucherDiscount;
        totalPrice = data.totalPrice;
        isVoucherForNewUser = data.isNew;
        discountType = data.discountType;
    }
    const order = new Order({
        ...req.body,
        userId: req.userId,
        orderCode,
        voucherName,
        voucherDiscount,
        shippingFee,
        voucherCode,
        totalPrice,
        discountType
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
    const now = new Date();
    if (currentUser.userIsOldWhen > now && isVoucherForNewUser) {
        await User.findByIdAndUpdate(userId, { $set: { userIsOldWhen: new Date() } });
    }
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
        .json(customResponse({ data: order, success: true, status: StatusCodes.OK, message: ReasonPhrases.OK }));
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
//@POST Set order status to cancelled
export const cancelOrder = async (req, res, next) => {
    const foundedOrder = await Order.findOne({ _id: req.body.orderId });
    const currentUser = await User.findById(req.userId).select('name email');
    const updaterName = currentUser
        ? req.role === ROLE.ADMIN
            ? `Admin - ${currentUser.name}`
            : `Khách hàng - ${currentUser.name}`
        : req.role === ROLE.ADMIN
          ? 'Admin'
          : 'Khách hàng';

    if (!foundedOrder) {
        throw new BadRequestError(`Không tìm thấy đơn hàng với ID: ${req.body.orderId}`);
    }

    if (foundedOrder.orderStatus === ORDER_STATUS.CANCELLED) {
        throw new NotAcceptableError(`Không thể hủy vì đơn hàng đã bị hủy từ trước!`);
    }

    if (foundedOrder.orderStatus !== ORDER_STATUS.DELIVERED && foundedOrder.orderStatus !== ORDER_STATUS.DONE) {
        if (req.role !== ROLE.ADMIN && foundedOrder.orderStatus !== ORDER_STATUS.PENDING) {
            throw new NotAcceptableError('Bạn không được phép hủy đơn vui lòng liên hệ nếu có vấn đề');
        }

        const oldStatus = foundedOrder.orderStatus;

        if (req.role === ROLE.ADMIN) {
            foundedOrder.canceledBy = ROLE.ADMIN;
        }
        foundedOrder.orderStatus = ORDER_STATUS.CANCELLED;
        foundedOrder.description = req.body.description ?? '';
        foundedOrder.statusLogs.push({
            status: ORDER_STATUS.CANCELLED,
            updatedBy: req.userId,
            updatedByName: updaterName,
            updatedByRole: req.role || 'USER',
            description: req.body.description ?? `Chuyển từ ${oldStatus} sang ${ORDER_STATUS.CANCELLED}`,
            updatedAt: new Date(),
        });

        await foundedOrder.save();

        // Update stock
        await inventoryService.updateStockOnCancelOrder(foundedOrder.items);
        await voucherService.rollbackVoucher(foundedOrder.voucherCode, foundedOrder.userId.toString());

        // Send mail
        const template = {
            content: {
                title: `${req.role === ROLE.ADMIN ? 'Đơn hàng của bạn đã bị hủy bởi admin' : 'Đơn hàng của bạn đã bị hủy'}`,
                description: `${req.role === ROLE.ADMIN ? `Đơn hàng của bạn đã bị hủy bởi admin với lý do ${foundedOrder.description}, ${foundedOrder.isPaid ? `Rất xin lỗi vì sự bất tiện này hãy liên hệ ngay với chúng tôi qua số điện thoại +84 123 456 789 để cửa hàng hoàn lại ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(foundedOrder.totalPrice || 0)} cho bạn ` : ''} dưới đây là thông tin đơn hàng:` : `Bạn vừa hủy một đơn hàng với lý do ${foundedOrder.description} từ VertaSport thông tin đơn hàng:`}`,
                email: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.email : '',
            },
            product: {
                items: foundedOrder.items,
                shippingfee: foundedOrder.shippingFee,
                totalPrice: foundedOrder.totalPrice,
            },
            subject: '[Verta-Sport] - Đơn hàng của bạn đã bị hủy',
            link: {
                linkHerf: `http://localhost:3000/my-orders/${req.body.orderId}`,
                linkName: `Kiểm tra đơn hàng`,
            },
            user: {
                name: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.name : '',
                phone: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.phone : '',
                email: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.email : '',
                address: `[${foundedOrder.shippingAddress.address}] -${foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? '' : ` ${foundedOrder.shippingAddress.ward}, ${foundedOrder.shippingAddress.district},`} ${foundedOrder.shippingAddress.province}, ${foundedOrder.shippingAddress.country}`,
            },
        };
        await sendMail({
            email: foundedOrder.customerInfo.email,
            template,
            type: 'UpdateStatusOrder',
        });
    } else {
        throw new NotAcceptableError(`Đơn hàng của bạn đã được giao không thể hủy đơn`);
    }

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            success: true,
            status: StatusCodes.OK,
            message: 'Your order is cancelled.',
        }),
    );
};
// @Set order status to confirmed
export const confirmOrder = async (req, res, next) => {
    if (!req.role || req.role !== ROLE.ADMIN) {
        throw new NotAcceptableError('Only admin can access.');
    }
    const currentUser = await User.findById(req.userId).select('name email');
    const updaterName = currentUser
        ? req.role === ROLE.ADMIN
            ? `Admin - ${currentUser.name}`
            : `Khách hàng - ${currentUser.name}`
        : req.role === ROLE.ADMIN
          ? 'Admin'
          : 'Khách hàng';

    const foundedOrder = await Order.findOne({ _id: req.body.orderId });

    if (!foundedOrder) {
        throw new BadRequestError(`Not found order with id ${req.body.orderId}`);
    }
    const oldStatus = foundedOrder.orderStatus;
    if (foundedOrder.orderStatus === ORDER_STATUS.PENDING) {
        foundedOrder.orderStatus = ORDER_STATUS.CONFIRMED;
        foundedOrder.description = req.body.description ?? '';
        foundedOrder.statusLogs.push({
            status: ORDER_STATUS.CONFIRMED,
            updatedBy: req.userId,
            updatedByName: updaterName,
            updatedByRole: req.role || 'USER',
            description: req.body.description ?? `Chuyển từ ${oldStatus} sang ${ORDER_STATUS.CONFIRMED}`,
            updatedAt: new Date(),
        });

        foundedOrder.save();
        const template = {
            content: {
                title: `Đơn hàng của bạn đã được xác nhận`,
                description: `Chúng tôi xin thông báo rằng đơn hàng của bạn với mã đơn hàng ${req.body.orderId} đã được xác nhận thành công. Đội ngũ của chúng tôi sẽ bắt đầu xử lý đơn hàng trong thời gian sớm nhất.`,
                email: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.email : '',
            },
            product: {
                items: foundedOrder.items,
                shippingfee: foundedOrder.shippingFee,
                totalPrice: foundedOrder.totalPrice,
            },
            subject: '[VertaSport] - Đơn hàng của bạn đã được xác nhận',
            link: {
                linkHerf: `http://localhost:3000/my-orders/${req.body.orderId}`,
                linkName: `Kiểm tra đơn hàng`,
            },
            user: {
                name: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.name : '',
                phone: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.phone : '',
                email: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.email : '',
                address: `[${foundedOrder.shippingAddress.address}] -${foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? '' : ` ${foundedOrder.shippingAddress.ward}, ${foundedOrder.shippingAddress.district},`} ${foundedOrder.shippingAddress.province}, ${foundedOrder.shippingAddress.country}`,
            },
        };
        await sendMail({
            email: foundedOrder.customerInfo.email,
            template,
            type: 'UpdateStatusOrder',
        });
    } else {
        throw new BadRequestError(`Your order is confirmed.`);
    }

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            success: true,
            status: StatusCodes.OK,
            message: 'Your order is confirmed.',
        }),
    );
};
// @Set order status to shipping
export const shippingOrder = async (req, res, next) => {
    if (!req.role || req.role !== ROLE.ADMIN) {
        throw new NotAcceptableError('Only admin can access.');
    }
    const currentUser = await User.findById(req.userId).select('name email');
    const updaterName = currentUser
        ? req.role === ROLE.ADMIN
            ? `Admin - ${currentUser.name}`
            : `Khách hàng - ${currentUser.name}`
        : req.role === ROLE.ADMIN
          ? 'Admin'
          : 'Khách hàng';
    const foundedOrder = await Order.findOne({
        _id: req.body.orderId,
    });

    if (!foundedOrder) {
        throw new BadRequestError(`Not found order with id ${req.body.orderId}`);
    }
    const oldStatus = foundedOrder.orderStatus;

    if (foundedOrder.orderStatus === ORDER_STATUS.CONFIRMED) {
        foundedOrder.orderStatus = ORDER_STATUS.SHIPPING;
        foundedOrder.description = req.body.description ?? '';
        foundedOrder.statusLogs.push({
            status: ORDER_STATUS.SHIPPING,
            updatedBy: req.userId,
            updatedByName: updaterName,
            updatedByRole: req.role || 'USER',
            description: req.body.description ?? `Chuyển từ ${oldStatus} sang ${ORDER_STATUS.SHIPPING}`,
            updatedAt: new Date(),
        });
        await foundedOrder.save();

        const template = {
            content: {
                title: `Đơn hàng của bạn đang được giao`,
                description: `Đơn hàng của đang được giao tới bạn vui lòng để ý điện thoại. Dưới đây là thông tin đơn hàng của bạn:`,
                email: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.email : '',
            },
            product: {
                items: foundedOrder.items,
                shippingfee: foundedOrder.shippingFee,
                totalPrice: foundedOrder.totalPrice,
            },
            subject: '[Verta-Sport] - Đơn hàng của bạn đang được giao',
            link: {
                linkHerf: `http://localhost:3000/my-orders/${req.body.orderId}`,
                linkName: `Kiểm tra đơn hàng`,
            },
            user: {
                name: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.name : '',
                phone: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.phone : '',
                email: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.email : '',
                address: `[${foundedOrder.shippingAddress.address}] -${foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? '' : ` ${foundedOrder.shippingAddress.ward}, ${foundedOrder.shippingAddress.district},`} ${foundedOrder.shippingAddress.province}, ${foundedOrder.shippingAddress.country}`,
            },
        };
        await sendMail({
            email: foundedOrder.customerInfo.email,
            template,
            type: 'UpdateStatusOrder',
        });
    } else {
        throw new BadRequestError(`Your order is not confirmed.`);
    }

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            success: true,
            status: StatusCodes.OK,
            message: 'Đơn hàng của bạn đang được giao.',
        }),
    );
};
// @ Set order status to delivered
export const deliverOrder = async (req, res, next) => {
    if (!req.role || req.role !== ROLE.ADMIN) {
        throw new NotAcceptableError('Only admin can access.');
    }

    const currentUser = await User.findById(req.userId).select('name email');
    const updaterName = currentUser
        ? req.role === ROLE.ADMIN
            ? `Admin - ${currentUser.name}`
            : `Khách hàng - ${currentUser.name}`
        : req.role === ROLE.ADMIN
          ? 'Admin'
          : 'Khách hàng';

    const foundedOrder = await Order.findOne({ _id: req.body.orderId });

    if (!foundedOrder) {
        throw new BadRequestError(`Not found order with id ${req.body.orderId}`);
    }
    const oldStatus = foundedOrder.orderStatus;
    if (foundedOrder.orderStatus === ORDER_STATUS.SHIPPING) {
        foundedOrder.orderStatus = ORDER_STATUS.DELIVERED;
        foundedOrder.description = req.body.description ?? '';
        foundedOrder.statusLogs.push({
            status: ORDER_STATUS.DELIVERED,
            updatedBy: req.userId,
            updatedByName: updaterName,
            updatedByRole: req.role || 'USER',
            description: req.body.description ?? `Chuyển từ ${oldStatus} sang ${ORDER_STATUS.DELIVERED}`,
            updatedAt: new Date(),
        });
        foundedOrder.save();
        const template = {
            content: {
                title: `Đơn hàng của bạn đã được giao thành công`,
                description: `Đơn hàng của bạn đã được xác nhận là giao thành công bởi người vận chuyển. Dưới đây là thông tin đơn hàng của bạn`,
                email: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.email : '',
                warning: `Nếu bạn chưa nhận được hàng vui lòng liên hệ tới email của Sport: vertarstport@gmail.com. Nếu đã nhận được hàng bạn vui lòng lên xác nhận lại tại trang đơn hàng của bạn. Trong trường hợp bạn đã nhận được hàng dựa theo chính sách chúng tôi sẽ cập nhật đơn hàng sang trạng thái hoàn thành sau 3 ngày!`,
            },
            product: {
                items: foundedOrder.items,
                shippingfee: foundedOrder.shippingFee,
                totalPrice: foundedOrder.totalPrice,
            },
            subject: '[Verta-Sport] - Đơn hàng của bạn đã được giao thành công',
            link: {
                linkHerf: `http://localhost:3000/my-orders/${req.body.orderId}`,
                linkName: `Kiểm tra đơn hàng`,
            },
            user: {
                name: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.name : '',
                phone: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.phone : '',
                email: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.email : '',
                address: `[${foundedOrder.shippingAddress.address}] -${foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? '' : ` ${foundedOrder.shippingAddress.ward}, ${foundedOrder.shippingAddress.district},`} ${foundedOrder.shippingAddress.province}, ${foundedOrder.shippingAddress.country}`,
            },
        };
        await sendMail({
            email: foundedOrder.customerInfo.email,
            template,
            type: 'UpdateStatusOrder',
        });
    } else {
        throw new BadRequestError(`Your order is delivered.`);
    }

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            success: true,
            status: StatusCodes.OK,
            message: 'This order is delivered.',
        }),
    );
};
// @Set order status to done
export const finishOrder = async (req, res, next) => {
    const foundedOrder = await Order.findOne({ _id: req.body.orderId });
    const currentUser = await User.findById(req.userId).select('name email');
    const updaterName = currentUser
        ? req.role === ROLE.ADMIN
            ? `Admin - ${currentUser.name}`
            : `Khách hàng - ${currentUser.name}`
        : req.role === ROLE.ADMIN
          ? 'Admin'
          : 'Khách hàng';
    if (!foundedOrder) {
        throw new BadRequestError(`Not found order with id ${req.body.orderId}`);
    }
    const oldStatus = foundedOrder.orderStatus;
    if (foundedOrder.orderStatus === ORDER_STATUS.DELIVERED) {
        foundedOrder.orderStatus = ORDER_STATUS.DONE;
        foundedOrder.isPaid = true;
        foundedOrder.description = req.body.description ?? '';
        foundedOrder.statusLogs.push({
            status: ORDER_STATUS.DONE,
            updatedBy: req.userId,
            updatedByName: updaterName,
            updatedByRole: req.role || 'USER',
            description: req.body.description ?? `Chuyển từ ${oldStatus} sang ${ORDER_STATUS.DONE}`,
            updatedAt: new Date(),
        });

        foundedOrder.save();
        const template = {
            content: {
                title: `Đơn hàng của bạn đã hoàn tất`,
                description: `Cảm ơn bạn đã tin tưởng và lựa chọn VertaSport cho nhu cầu mua sắm của mình.Nếu bạn cần hỗ trợ hoặc có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi`,
                email: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.email : '',
            },
            product: {
                items: foundedOrder.items,
                shippingfee: foundedOrder.shippingFee,
                totalPrice: foundedOrder.totalPrice,
            },
            subject: '[Verta-Sport] - Đơn hàng của bạn đã hoàn thành',
            link: {
                linkHerf: `http://localhost:3000/my-orders/${req.body.orderId}`,
                linkName: `Kiểm tra đơn hàng`,
            },
            user: {
                name: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.name : '',
                phone: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.phone : '',
                email: foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? foundedOrder.customerInfo.email : '',
                address: `[${foundedOrder.shippingAddress.address}] -${foundedOrder.paymentMethod === PAYMENT_METHOD.CARD ? '' : ` ${foundedOrder.shippingAddress.ward}, ${foundedOrder.shippingAddress.district},`} ${foundedOrder.shippingAddress.province}, ${foundedOrder.shippingAddress.country}`,
            },
        };
        await sendMail({
            email: foundedOrder.customerInfo.email,
            template,
            type: 'UpdateStatusOrder',
        });
    } else {
        throw new BadRequestError(`Your order is done.`);
    }

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            success: true,
            status: StatusCodes.OK,
            message: 'Đơn hàng của bạn đã hoàn tất.',
        }),
    );
};

export const getOrderStatusHistory = async (req: Request, res: Response, next) => {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).select('statusLogs').populate('statusLogs.updatedBy', 'email name');

    if (!order) {
        throw new NotFoundError(`Order with id ${orderId} not found`);
    }

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: order.statusLogs,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
};
