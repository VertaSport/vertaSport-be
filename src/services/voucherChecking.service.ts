/* eslint-disable no-extra-boolean-cast */
import { BadRequestError } from '@/error/customError';
import UsedVoucher from '@/models/UsedVoucher';
import User from '@/models/User';
import Voucher from '@/models/Voucher';

export const checkVoucherIsValid = async (
    voucherCode: string,
    userId: string,
    totalPriceNoShip: number,
): Promise<{
    voucherName: string;
    voucherDiscount: number;
    code: string;
    discountType: string;
    maxDiscountAmount: number;
    totalPrice: number;
}> => {
    const [voucherData, currentUser] = await Promise.all([
        Voucher.findOne({ code: voucherCode }).lean(),
        User.findById(userId).lean(),
    ]);
    const isNewUser = currentUser?.userIsOldWhen > new Date();

    if (!voucherCode) {
        return {
            voucherName: '',
            voucherDiscount: 0,
            code: '',
            discountType: '',
            maxDiscountAmount: 0,
            totalPrice: totalPriceNoShip,
        };
    }

    if (!voucherData) {
        throw new BadRequestError(`Voucher đã hết hạn quý khách vui lòng chọn voucher khác`);
    }

    if (!currentUser) {
        throw new BadRequestError(`Người dùng không tồn tại`);
    }

    if (voucherData.isOnlyForNewUser && !isNewUser) {
        throw new BadRequestError(`Voucher này chỉ dành cho người dùng mới`);
    }

    const now = new Date();
    const startDate = new Date(voucherData.startDate);
    const endDate = new Date(voucherData.endDate);

    if (totalPriceNoShip < voucherData.minimumOrderPrice) {
        throw new BadRequestError(`Đơn hàng của bạn không đủ điều kiện sử dụng voucher ${voucherCode}`);
    }

    if (startDate > now || endDate < now) {
        throw new BadRequestError(`Voucher ${voucherCode} đã hết hạn quý khách vui lòng chọn voucher khác`);
    }

    if (voucherData.status === false) {
        throw new BadRequestError(`Voucher ${voucherCode} đã hết hạn quý khách vui lòng chọn voucher khác`);
    }

    const [userVoucherCount, voucherUsageCount] = await Promise.all([
        UsedVoucher.findOne({ userId, voucherCode: voucherCode }),
        UsedVoucher.countDocuments({ voucherCode: voucherCode }),
    ]);

    if (voucherUsageCount >= voucherData.maxUsage) {
        throw new BadRequestError(`Voucher ${voucherCode} đã hết lượt sử dụng`);
    }
    if (userVoucherCount && userVoucherCount.usageCount >= voucherData.usagePerUser) {
        throw new BadRequestError(`Voucher ${voucherCode} đã hết lượt sử dụng`);
    }
    await UsedVoucher.findOneAndUpdate(
        { userId, voucherCode },
        { $inc: { usageCount: 1 } },
        { upsert: true, new: true },
    );

    let actualDiscount = voucherData.voucherDiscount;
    if (voucherData.discountType === 'percentage') {
        const calculatedDiscount = (totalPriceNoShip * voucherData.voucherDiscount) / 100;

        if (voucherData.maxDiscountAmount > 0 && calculatedDiscount > voucherData.maxDiscountAmount) {
            throw new BadRequestError(`Số tiền giảm giá vượt quá mức tối đa cho phép của voucher ${voucherCode}`);
        }

        actualDiscount = calculatedDiscount;
    }

    return {
        voucherName: voucherData.name,
        voucherDiscount: actualDiscount,
        code: voucherCode,
        discountType: voucherData.discountType,
        maxDiscountAmount: voucherData.maxDiscountAmount || 0,
        totalPrice: totalPriceNoShip - actualDiscount,
    };
};

export const rollbackVoucher = async (voucherCode: string, userId: string) => {
    const usedVoucher = await UsedVoucher.findOne({
        userId: userId,
        voucherCode: voucherCode,
    });

    // Voucher rollback
    if (usedVoucher) {
        if (usedVoucher.usageCount > 1) {
            usedVoucher.usageCount = usedVoucher.usageCount - 1;
            await usedVoucher.save();
        } else {
            await UsedVoucher.deleteOne({ userId: userId, voucherCode: voucherCode });
        }
    }
};
