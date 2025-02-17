import { BadRequestError, NotFoundError } from '@/error/customError';
import Cart, { ICartSchema } from '@/models/Cart';
import Product from '@/models/Product';
import Variant from '@/models/Variant';
import path from 'path';

// @Get cart by user
export const getCartByUser = async (userId: string) => {
    const cartUser = await Cart.findOne({ userId })
        .populate([
            {
                path: 'items.variant',
                select: '-createdAt -updatedAt -imageRef',
                populate: [
                    {
                        path: 'color',
                        select: '-createdAt -updatedAt',
                    },
                    {
                        path: 'size',
                        select: '-createdAt -updatedAt',
                    },
                ],
            },
            {
                path: 'items.product',
                select: '-createdAt -updatedAt -imageRef',
            },
        ])
        .exec();

    if (!cartUser) throw new NotFoundError('Not found cart or cart is not exist.');

    cartUser.items.forEach((item) => {
        const variant = item.variant as unknown as { stock: number };
        if (variant.stock < item.quantity) {
            item.quantity = variant.stock;
        }
    });
    await cartUser.save();

    cartUser.items.filter((item) => {
        const product = item.variant as unknown as { isDeleted: boolean; isHide: boolean };
        if (product.isHide || product.isDeleted) {
            return false;
        }
        return true;
    });

    return cartUser;
};

export const validateHandleCart = async ({
    productId,
    variantId,
    quantity,
    userId,
}: {
    productId: string;
    variantId: string;
    userId: string;
    quantity: number;
}) => {
    const [product, variant, currentCart] = await Promise.all([
        Product.findById(productId).select({ isHide: 1, isDeleted: 1 }).lean(),
        Variant.findById(variantId).select({ stock: 1 }).lean(),
        Cart.findOne({ userId }).select({ items: 1 }).lean(),
    ]);

    if (!product) throw new BadRequestError(`Not found product`);

    if (!variant) throw new BadRequestError(`Not found product`);

    if (quantity < 1) throw new BadRequestError(`Quantity must be at least 1`);

    if (quantity > variant.stock!) quantity = variant.stock;

    return { product, variant, currentCart, quantity, userId, productId, variantId };
};

// @Add to cart
export const addToCart = async <T extends ICartSchema>({
    currentCart,
    quantity,
    variantId,
    variant,
    userId,
    productId,
}: {
    currentCart: T;
    variant: { stock: number };
    quantity: number;
    variantId: string;
    userId: string;
    productId: string;
}) => {
    let updatedCart = null;

    if (currentCart && currentCart.items.length > 0) {
        const variantInThisCart = currentCart.items.find((item) => item.variant.toString() == variantId);
        const currentQuantity = variantInThisCart?.quantity || 0;
        const newQuantity = currentQuantity + quantity;
        updatedCart = await Cart.findOneAndUpdate(
            { userId, 'items.variant': variantId },
            { $set: { 'items.$.quantity': newQuantity > variant.stock! ? variant.stock! : newQuantity } },
            { new: true, upsert: false },
        );
    }

    if (!updatedCart) {
        updatedCart = await Cart.findOneAndUpdate(
            { userId },
            { $push: { items: { variant: variantId, product: productId, quantity: quantity } } },
            { new: true, upsert: true },
        );
    }

    return updatedCart;
};

// @Remove one cart item
export const removeCartItem = async ({ variantId, userId }: { variantId: string; userId: string }) => {
    const updatedCart = await Cart.findOneAndUpdate(
        { userId },
        { $pull: { items: { variant: variantId } } },
        { new: true },
    );
    if (!updatedCart) throw new BadRequestError(`Not found cart`);
};

// @Remove all cart items
// export const removeAllCartItems = async (req: Request, res: Response, next: NextFunction) => {
//     const cart = await Cart.findOneAndUpdate({ userId: req.body.userId }, { items: [] }, { new: true }).lean();

//     if (!cart) throw new BadRequestError(`Not found cart with userId: ${req.body.userId}`);

//     return res.status(StatusCodes.NO_CONTENT).json(
//         customResponse({
//             data: null,
//             success: true,
//             status: StatusCodes.NO_CONTENT,
//             message: ReasonPhrases.NO_CONTENT,
//         }),
//     );
// };

// @Update  cart item quantity
export const updateCartItemQuantity = async ({
    quantity,
    variantId,
    userId,
}: {
    quantity: number;
    variantId: string;
    userId: string;
}) => {
    // const product = await ProductVariation.findById(req.body.productVariation).select({ stock: 1 }).lean();
    // if (!product) throw new BadRequestError(`Not found product with Id: ${req.body.productVariation}`);

    // if (quantity < 1) throw new BadRequestError(`Quantity must be at least 1`);
    // if (quantity > product.stock!) quantity = product.stock;

    const updatedQuantity = await Cart.findOneAndUpdate(
        { userId, 'items.variant': variantId },
        { $set: { 'items.$.quantity': quantity } },
        { new: true },
    );
    if (!updatedQuantity) throw new BadRequestError(`Not found product `);

    return updatedQuantity;
};
