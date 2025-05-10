import { BadRequestError, NotAcceptableError, NotFoundError } from '@/error/customError';
import { ItemOrder } from '@/interfaces/schema/order';
import Product from '@/models/Product';
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
            await Product.findByIdAndUpdate(item.productId, {
                $inc: {
                    sold: item.quantity,
                },
            });
            return await Variant.updateOne(
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
            await Product.findByIdAndUpdate(item.productId, {
                $inc: {
                    sold: -item.quantity,
                },
            });
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

export const checkProductStatus = async (items: ItemOrder[]) => {
    const products = await Product.find({
        _id: { $in: items.map((item: ItemOrder) => item.productId) },
    })
        .populate({
            path: 'variants',
            select: 'stock',
        })
        .select('isHide isDeleted')
        .lean();

    if (!products) throw new NotFoundError('Không tìm thấy sản phẩm');

    const isOutOfStock = products.some((item: any) => {
        const productTarget = items.find((pro: ItemOrder) => pro.productId === String(item._id));
        if (productTarget!.quantity > item.stock!) {
            return true;
        }
    });
    const isHidedProduct = products.some((item) => {
        if (item.isHide) {
            return true;
        }
    });
    const isDeletedProduct = products.some((item) => {
        if (item.isDeleted) {
            return true;
        }
    });

    if (isOutOfStock) {
        throw new NotAcceptableError('Sản phẩm đã hết hàng');
    }

    if (isHidedProduct) {
        throw new NotAcceptableError('Sản phẩm không tồn tại');
    }

    if (isDeletedProduct) {
        throw new NotAcceptableError('Sản phẩm không tồn tại');
    }
};
