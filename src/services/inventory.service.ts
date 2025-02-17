import { BadRequestError } from '@/error/customError';
import { ItemOrder } from '@/interfaces/schema/order';
import Variant from '@/models/Variant';

export const updateStockOnCreateOrder = async (dataItems: ItemOrder[]) => {
    return Promise.all(
        dataItems.map(async (item: ItemOrder) => {
            const variant = await Variant.findById(item.variantId).lean();
            if (variant.stock === 0) {
                throw new BadRequestError('Có sản phẩm hiện đã hết hàng!');
            }
            if (!variant) {
                throw new BadRequestError(`Không tìm thấy biến thể sản phẩm với ID: ${item.variantId}`);
            }

            if (variant.stock < item.quantity) {
                throw new BadRequestError(`Số lượng đặt hàng cho sản phẩm ${item.name} vượt quá số lượng tồn kho!`);
            }
            return Variant.updateOne(
                { _id: item.variantId },
                {
                    $inc: {
                        sold: item.quantity,
                        stock: -item.quantity,
                    },
                },
            );
        }),
    );
};

export const updateStockOnCancelOrder = async (dataItems: ItemOrder[]) => {
    return await Promise.all(
        dataItems.map(async (item: ItemOrder) => {
            await Variant.updateOne(
                { _id: item.variantId },
                {
                    $inc: {
                        sold: -item.quantity,
                        stock: item.quantity,
                    },
                },
            );
        }),
    );
};
