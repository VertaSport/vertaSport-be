import { cartController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticationMiddleware';
import { Router } from 'express';

const cartRouter = Router();

cartRouter.get('/', authenticate, cartController.getAllCart);
cartRouter.delete('/:variantId', authenticate, cartController.removeCartItem);
cartRouter.post('/add', authenticate, cartController.addToCart);
cartRouter.patch('/update-quantity', authenticate, cartController.updateCartItem);

export default cartRouter;
