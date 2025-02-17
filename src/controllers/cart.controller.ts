import asyncHandler from '@/helpers/asyncHandler';
import customResponse from '@/helpers/response';
import { cartService } from '@/services';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

// Add to cart
export const addToCart = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { productId, variantId, quantity, userId, currentCart, variant, product } =
        await cartService.validateHandleCart({
            productId: req.body.productId,
            variantId: req.body.variantId,
            quantity: req.body.quantity,
            userId: req.userId,
        });
    await cartService.addToCart<any>({
        productId,
        variantId,
        quantity,
        userId,
        currentCart,
        variant,
    });

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

// Update cart item
export const updateCartItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { variantId, quantity, userId } = await cartService.validateHandleCart({
        productId: req.body.productId,
        variantId: req.body.variantId,
        quantity: req.body.quantity,
        userId: req.userId,
    });
    await cartService.updateCartItemQuantity({
        variantId,
        quantity,
        userId,
    });

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

// Remove one cart item
export const removeCartItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const variantId = req.params.variantId;
    console.log(variantId, 'ok');
    await cartService.removeCartItem({
        userId,
        variantId,
    });

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: null,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});

// get all cart by user
export const getAllCart = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const carts = await cartService.getCartByUser(req.userId);

    return res.status(StatusCodes.OK).json(
        customResponse({
            data: carts,
            success: true,
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        }),
    );
});
