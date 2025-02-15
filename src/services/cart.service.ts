import { BadRequestError, NotFoundError } from '@/error/customError';
import customResponse from '@/helpers/response';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import Variant from '@/models/Variant';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

// @Get cart by user
export const getCartByUser = async (req: Request, res: Response, next: NextFunction) => {
    const cartUser = await Cart.findOne({ userId: req.params.id })
        .populate('items.product')
        .populate('items.variant')
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

    return res
        .status(StatusCodes.OK)
        .json(customResponse({ data: cartUser, success: true, status: StatusCodes.OK, message: ReasonPhrases.OK }));
};

// @Add to cart
export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
    let updatedCart = null;
    const { productId, variantId } = req.body;
    let { quantity } = req.body;
    const userId = 'test';
    const [product, variant, currentCart] = await Promise.all([
        Product.findById(productId).select({ isHide: 1, isDeleted: 1 }).lean(),
        Variant.findById(variantId).select({ stock: 1 }).lean(),
        Cart.findOne({ userId }).select({ items: 1 }).lean(),
    ]);

    if (!product) throw new BadRequestError(`Not found product`);

    if (!variant) throw new BadRequestError(`Not found product`);

    if (quantity < 1) throw new BadRequestError(`Quantity must be at least 1`);

    if (quantity > variant.stock!) quantity = variant.stock;

    if (currentCart && currentCart.items.length > 0) {
        const variantInThisCart = currentCart.items.find((item) => item.variant == variantId);
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

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: updatedCart,
            success: true,
            status: StatusCodes.CREATED,
            message: ReasonPhrases.CREATED,
        }),
    );
};

// @Remove one cart item
export const removeCartItem = async (req: Request, res: Response, next: NextFunction) => {
    const updatedCart = await Cart.findOneAndUpdate(
        { userId: req.body.userId },
        { $pull: { items: { productVariation: req.body.productVariation } } },
        { new: true },
    );
    if (!updatedCart) throw new BadRequestError(`Not found cart with userId: ${req.body.userId}`);
    return res
        .status(StatusCodes.OK)
        .json(customResponse({ data: updatedCart, success: true, status: StatusCodes.OK, message: ReasonPhrases.OK }));
};

// @Remove all cart items
export const removeAllCartItems = async (req: Request, res: Response, next: NextFunction) => {
    const cart = await Cart.findOneAndUpdate({ userId: req.body.userId }, { items: [] }, { new: true }).lean();

    if (!cart) throw new BadRequestError(`Not found cart with userId: ${req.body.userId}`);

    return res.status(StatusCodes.NO_CONTENT).json(
        customResponse({
            data: null,
            success: true,
            status: StatusCodes.NO_CONTENT,
            message: ReasonPhrases.NO_CONTENT,
        }),
    );
};

// @Update  cart item quantity
export const updateCartItemQuantity = async (req: Request, res: Response, next: NextFunction) => {
    const product = await ProductVariation.findById(req.body.productVariation).select({ stock: 1 }).lean();
    if (!product) throw new BadRequestError(`Not found product with Id: ${req.body.productVariation}`);

    if (quantity < 1) throw new BadRequestError(`Quantity must be at least 1`);
    if (quantity > product.stock!) quantity = product.stock;

    const updatedQuantity = await Cart.findOneAndUpdate(
        { userId: req.body.userId, 'items.productVariation': req.body.productVariation },
        { $set: { 'items.$.quantity': quantity } },
        { new: true },
    );
    if (!updatedQuantity)
        throw new BadRequestError(
            `Not found product with Id: ${req.body.productVariation} inside this cart or cart not found`,
        );

    return res
        .status(StatusCodes.OK)
        .json(
            customResponse({ data: updatedQuantity, success: true, status: StatusCodes.OK, message: ReasonPhrases.OK }),
        );
};
