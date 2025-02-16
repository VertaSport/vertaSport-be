import { cartController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticationMiddleware';
import { Router } from 'express';

const cartRouter = Router();

cartRouter.post('/add', authenticate, cartController.addToCart);
cartRouter.post('/update-quantity', authenticate, cartController.updateCartItem);
cartRouter.post('/delete', authenticate, cartController.removeCartItem);
cartRouter.get('/', authenticate, cartController.getAllCart);

export default cartRouter;
