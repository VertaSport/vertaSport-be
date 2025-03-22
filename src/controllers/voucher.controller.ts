import { BadRequestError } from '@/error/customError';
import asyncHandler from '@/helpers/asyncHandler';
import customResponse from '@/helpers/response';
import UsedVoucher from '@/models/UsedVoucher';
import User from '@/models/User';
import Voucher, { DiscountType } from '@/models/Voucher';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import APIQuery from '@/helpers/apiQuery';

function generateVoucherCode(length = 8) {
    const rune = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * rune.length);
        code += rune[randomIndex];
    }
    return code;
}
export const createVoucher = asyncHandler(async (req: Request, res: Response) => {
    const {
        startDate,
        endDate,
        name,
        voucherDiscount,
        minimumOrderPrice,
        status,
        maxUsage,
        usagePerUser,
        discountType,
        maxDiscountAmount,
        isOnlyForNewUser = false,
    } = req.body;
    const currentDate = new Date();

    const existingVoucherByName = await Voucher.findOne({ name });

    if (existingVoucherByName) {
        throw new BadRequestError('Tên voucher đã tồn tại');
    }

    const existingVoucherByCode = await Voucher.findOne({ code: req.body.code });
    if (existingVoucherByCode) {
        throw new BadRequestError('Mã voucher đã tồn tại');
    }

    if (maxUsage <= 0) {
        throw new BadRequestError('Số lần sử dụng tối đa phải lớn hơn 0');
    }

    if (minimumOrderPrice <= 0) {
        throw new BadRequestError('Giá trị đơn hàng tối thiểu phải lớn hơn 0');
    }

    if (usagePerUser <= 0) {
        throw new BadRequestError('Số lần sử dụng mỗi người phải lớn hơn 0');
    }

    if (new Date(startDate) < currentDate || new Date(endDate) < currentDate) {
        throw new BadRequestError('Ngày bắt đầu và ngày kết thúc phải sau ngày hiện tại');
    }

    if (new Date(startDate) >= new Date(endDate)) {
        throw new BadRequestError('Ngày bắt đầu phải trước ngày kết thúc');
    }

    if (discountType === 'percentage' && (voucherDiscount <= 0 || voucherDiscount > 100)) {
        throw new BadRequestError('Phần trăm giảm giá phải lớn hơn 0 và không vượt quá 100');
    }

    if (discountType === 'percentage' && (!maxDiscountAmount || maxDiscountAmount <= 0)) {
        throw new BadRequestError('Giá trị giảm giá tối đa phải lớn hơn 0 khi sử dụng phần trăm');
    }

    if (discountType === 'fixed' && voucherDiscount <= 0) {
        throw new BadRequestError('Giá trị giảm giá phải lớn hơn 0');
    }

    if (discountType === 'fixed' && voucherDiscount >= minimumOrderPrice) {
        throw new BadRequestError('Giá trị giảm giá phải nhỏ hơn giá trị đơn hàng tối thiểu');
    }

    const newVoucher = await Voucher.create({
        startDate,
        endDate,
        name,
        voucherDiscount,
        minimumOrderPrice,
        status,
        isOnlyForNewUser,
        code: req.body.code || generateVoucherCode(),
        maxUsage,
        usagePerUser,
        discountType: discountType || 'percentage',
        maxDiscountAmount: discountType === 'percentage' ? maxDiscountAmount : 0,
    });

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: newVoucher,
            message: 'Tạo voucher thành công',
            status: StatusCodes.OK,
            success: true,
        }),
    );
});
export const updateVoucher = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        startDate,
        endDate,
        name,
        voucherDiscount,
        minimumOrderPrice,
        status,
        maxUsage,
        isOnlyForNewUser,
        usagePerUser,
        discountType,
        maxDiscountAmount,
    } = req.body;
    const currentDate = new Date();

    const existingVoucher = await Voucher.findById(id);

    if (!existingVoucher) {
        throw new BadRequestError('Voucher không tồn tại');
    }

    const existingVoucherByName = await Voucher.findOne({ name, _id: { $ne: id } });
    if (existingVoucherByName) {
        throw new BadRequestError('Tên voucher đã tồn tại');
    }

    if (maxUsage <= 0) {
        throw new BadRequestError('Số lần sử dụng tối đa phải lớn hơn 0');
    }

    if (minimumOrderPrice <= 0) {
        throw new BadRequestError('Giá trị đơn hàng tối thiểu phải lớn hơn 0');
    }

    if (usagePerUser <= 0) {
        throw new BadRequestError('Số lần sử dụng mỗi người phải lớn hơn 0');
    }

    if (new Date(startDate) < currentDate || new Date(endDate) < currentDate) {
        throw new BadRequestError('Ngày bắt đầu và ngày kết thúc phải sau ngày hiện tại');
    }

    if (new Date(startDate) >= new Date(endDate)) {
        throw new BadRequestError('Ngày bắt đầu phải trước ngày kết thúc');
    }

    if (discountType === 'percentage' && (voucherDiscount <= 0 || voucherDiscount > 100)) {
        throw new BadRequestError('Phần trăm giảm giá phải lớn hơn 0 và không vượt quá 100');
    }

    if (discountType === 'percentage' && (!maxDiscountAmount || maxDiscountAmount <= 0)) {
        throw new BadRequestError('Giá trị giảm giá tối đa phải lớn hơn 0 khi sử dụng phần trăm');
    }

    if (discountType === 'fixed' && voucherDiscount <= 0) {
        throw new BadRequestError('Giá trị giảm giá phải lớn hơn 0');
    }

    if (discountType === 'fixed' && voucherDiscount >= minimumOrderPrice) {
        throw new BadRequestError('Giá trị giảm giá phải nhỏ hơn giá trị đơn hàng tối thiểu');
    }

    existingVoucher.name = name;
    existingVoucher.voucherDiscount = voucherDiscount;
    existingVoucher.usagePerUser = usagePerUser;
    existingVoucher.isOnlyForNewUser = isOnlyForNewUser;
    existingVoucher.startDate = startDate;
    existingVoucher.endDate = endDate;
    existingVoucher.maxUsage = maxUsage;
    existingVoucher.minimumOrderPrice = minimumOrderPrice;
    existingVoucher.status = status;
    existingVoucher.discountType = discountType || 'percentage';
    existingVoucher.maxDiscountAmount = discountType === 'percentage' ? maxDiscountAmount : 0;

    if (req.body.resetCode) {
        existingVoucher.code = generateVoucherCode();
    }

    await existingVoucher.save();

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: existingVoucher,
            message: 'Cập nhật voucher thành công',
            status: StatusCodes.OK,
            success: true,
        }),
    );
});

export const updateVoucherStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const existingVoucher = await Voucher.findById(id);
    if (!existingVoucher) {
        throw new BadRequestError('Voucher không tồn tại');
    }

    existingVoucher.status = !existingVoucher.status;
    await existingVoucher.save();

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: existingVoucher,
            message: 'Cập nhật trạng thái voucher thành công',
            status: StatusCodes.OK,
            success: true,
        }),
    );
});

export const getVoucherDetails = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const voucher = await Voucher.findById(id);
    if (!voucher) {
        throw new BadRequestError('Voucher không tồn tại');
    }

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: voucher,
            message: 'Chi tiết voucher',
            status: StatusCodes.OK,
            success: true,
        }),
    );
});

export const getAllVoucher = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId;
    const currentDate = new Date();

    const ListVouchers = await Voucher.find({
        status: true,
        isOnlyForNewUser: false,
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
        maxUsage: { $gt: 0 },
    }).lean();

    const processedVouchers = await Promise.all(
        ListVouchers.map(async (voucher) => {
            const voucherUsedByUser = await UsedVoucher.findOne({ userId, voucherCode: voucher.code });

            // Get total usage count across all users
            const voucherUsageAggregate = await UsedVoucher.aggregate([
                { $match: { voucherCode: voucher.code } },
                { $group: { _id: null, totalUsage: { $sum: '$usageCount' } } },
            ]);

            const totalUsageCount = voucherUsageAggregate[0]?.totalUsage || 0;
            const remainingQuantity = voucher.maxUsage - totalUsageCount;

            return {
                ...voucher,
                usedCount: voucherUsedByUser?.usageCount || 0,
                remainingQuantity,
            };
        }),
    );

    // // Split vouchers by discount type
    // const percentageVouchers = processedVouchers.filter((voucher) => voucher.discountType === DiscountType.Percentage);
    // const fixedVouchers = processedVouchers.filter((voucher) => voucher.discountType === DiscountType.Fixed);

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: processedVouchers,
            message: 'Danh sách voucher cho người dùng',
            status: StatusCodes.OK,
            success: true,
        }),
    );
});

export const getVoucherForNewUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId;
    const currentUser = await User.findById(userId);
    const now = new Date();
    const checkUserIsNew = currentUser.userIsOldWhen > now;
    if (!checkUserIsNew) {
        throw new BadRequestError('Người dùng không tồn tại');
    }

    const ListVouchers = await Voucher.find({
        isOnlyForNewUser: true,
        status: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
        maxUsage: { $gt: 0 },
    }).lean();

    const processedVouchers = await Promise.all(
        ListVouchers.map(async (voucher) => {
            const voucherUsedByUser = await UsedVoucher.findOne({ userId, voucherCode: voucher.code });
            return { ...voucher, usedCount: voucherUsedByUser?.usageCount || 0 };
        }),
    );

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: processedVouchers,
            message: 'Danh sách voucher cho người dùng mới',
            status: StatusCodes.OK,
            success: true,
        }),
    );
});

export const getAllVoucherForAdmin = asyncHandler(async (req: Request, res: Response) => {
    const features = new APIQuery(Voucher.find(), req.query);
    features.filter().sort().limitFields().search().paginate();
    const [data, totalDocs] = await Promise.all([features.query, features.count()]);

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: {
                vouchers: data,
                totalDocs,
            },
            message: 'Danh sách tất cả voucher',
            status: StatusCodes.OK,
            success: true,
        }),
    );
});
